const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const shranjevanjeMapa = path.join(__dirname, 'nalozeneDatoteke');
const protectedDir = path.join(__dirname, 'protected');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'VidSql123S!',
    database: 'SpletnaStran'
});

db.connect(err => {
    if (err) {
        console.error('Napaka pri povezavi z bazo:', err);
        return;
    }
    console.log('Povezava z bazo uspešna');
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'tajni_kljuc',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge:  60*60 * 1000
    }
}));

const preveriPrijavo = (req, res, next) => {
    if (!req.session.user) {
        if (req.accepts('html')) {
            return res.redirect('/login.html');
        }
        return res.status(401).json({ error: 'Ni avtorizacije' });
    }
    next();
};

app.use(express.static(path.join(__dirname, 'public')));

app.get(['/', '/datoteke.html'], preveriPrijavo, (req, res) => {
    res.sendFile(path.join(protectedDir, 'datoteke.html'));
});

// Nova pot za preverjanje uporabniškega imena
app.post('/preveriIme', async (req, res) => {
    const { username } = req.body;
    
    try {
        const [users] = await db.promise().query(
            'SELECT * FROM uporabniki WHERE username = ?', 
            [username]
        );
        
        res.json({ available: users.length === 0 });
    } catch (error) {
        console.error('Napaka pri preverjanju uporabniškega imena:', error);
        res.status(500).json({ error: 'Napaka na strežniku' });
    }
});

// Posodobljena registracijska pot
app.post('/registracija', async (req, res) => {
    const { username, password, confirmPassword } = req.body;
    
    // Preverjanje na strežniku
    const errors = {};
    
    if (password !== confirmPassword) {
        errors.password = 'Gesli se ne ujemata';
    }
    
    try {
        const [existingUsers] = await db.promise().query(
            'SELECT * FROM uporabniki WHERE username = ?', 
            [username]
        );
        
        if (existingUsers.length > 0) {
            errors.username = 'Uporabniško ime že obstaja';
        }
        
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.promise().query(
            'INSERT INTO uporabniki (username, password) VALUES (?, ?)', 
            [username, hashedPassword]
        );
        
        // Avtomatska prijava po registraciji
        const [newUser] = await db.promise().query(
            'SELECT * FROM uporabniki WHERE username = ?', 
            [username]
        );
        
        req.session.user = { 
            id: newUser[0].id, 
            username: newUser[0].username 
        };
        
        res.redirect('/');
        
    } catch (error) {
        console.error('Napaka pri registraciji:', error);
        res.status(500).json({ error: 'Napaka na strežniku' });
    }
});

app.post('/prijava', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM uporabniki WHERE username = ?', [username], async (err, results) => {
        if (err || results.length === 0) {
            return res.redirect('/login.html?error=1');
        }

        const isValid = await bcrypt.compare(password, results[0].password);
        if (!isValid) {
            return res.redirect('/login.html?error=1');
        }

        req.session.user = { id: results[0].id, username: results[0].username };
        req.session.save(err => {
            if (err) {
                console.error('Napaka pri shranjevanju seje:', err);
                return res.redirect('/login.html?error=2');
            }
            res.redirect('/');
        });
    });
});

app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login.html');
    });
});

app.get('/api/datoteke', preveriPrijavo, (req, res) => {
    fs.readdir(shranjevanjeMapa, { withFileTypes: true }, (err, files) => {
        if (err) return res.status(500).json({ error: 'Napaka pri branju datotek' });

        const fileList = files.map(file => {
            const filePath = path.join(shranjevanjeMapa, file.name);
            const stats = fs.statSync(filePath);
            return {
                name: file.name,
                size: stats.size,
                createdAt: stats.birthtimeMs,
                isDirectory: file.isDirectory()
            };
        });

        res.json(fileList);
    });
});

app.delete('/api/izbrisi/:ime', preveriPrijavo, (req, res) => {
    const ime = decodeURIComponent(req.params.ime);
    const filePath = path.join(shranjevanjeMapa, ime);

    fs.rm(filePath, { recursive: true, force: true }, (err) => {
        if (err) return res.status(500).json({ error: `Napaka pri brisanju: ${err.message}` });
        res.sendStatus(204);
    });
});

const shrambaDatotek = multer.diskStorage({
    destination: (req, file, cb) => cb(null, shranjevanjeMapa),
    filename: (req, file, cb) => cb(null, file.originalname)
});

const shrambaMap = multer.diskStorage({
    destination: (req, file, cb) => {
        const cilj = path.join(shranjevanjeMapa, req.body.mapa);
        fs.mkdirSync(cilj, { recursive: true });
        cb(null, cilj);
    },
    filename: (req, file, cb) => cb(null, file.originalname.replace(/^.*[\\\/]/, ''))
});

const nalaganjeDatotek = multer({ storage: shrambaDatotek });
const nalaganjeMap = multer({ storage: shrambaMap });

app.post('/naloziDatoteko', preveriPrijavo, nalaganjeDatotek.array('datoteka'), (req, res) => {
    res.sendStatus(204);
});

app.post('/naloziMapo', preveriPrijavo, nalaganjeMap.array('datoteka'), (req, res) => {
    res.sendStatus(204);
});

app.get('/prenesiMapo/:imePreneseneMape', preveriPrijavo, (req, res) => {
    const imeMape = req.params.imePreneseneMape;
    const potMape = path.join(shranjevanjeMapa, imeMape);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    res.attachment(`${imeMape}.zip`);
    archive.pipe(res);
    archive.directory(potMape, false);
    archive.finalize();
});

// Dodajte novo pot za pridobivanje velikosti mape
app.get('/api/velikostMape/:imePreneseneMape', preveriPrijavo, (req, res) => {
    const imeMape = decodeURIComponent(req.params.imePreneseneMape);
    const potMape = path.join(shranjevanjeMapa, imeMape);

    if (!fs.existsSync(potMape)) {
        return res.status(404).json({ error: 'Mapa ne obstaja' });
    }

    const izracunajVelikost = (pot) => {
        let velikost = 0;
        const elementi = fs.readdirSync(pot, { withFileTypes: true });
        
        for (const element of elementi) {
            const elementPot = path.join(pot, element.name);
            if (element.isFile()) {
                velikost += fs.statSync(elementPot).size;
            } else if (element.isDirectory()) {
                velikost += izracunajVelikost(elementPot);
            }
        }
        return velikost;
    };

    try {
        const velikost = izracunajVelikost(potMape);
        res.json({ velikost });
    } catch (error) {
        console.error('Napaka pri računanju velikosti mape:', error);
        res.status(500).json({ error: 'Napaka na strežniku' });
    }
});
app.use('/nalozeneDatoteke', preveriPrijavo, express.static(shranjevanjeMapa));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Strežnik teče na http://localhost:${PORT}`);
    
});