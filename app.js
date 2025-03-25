const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const app = express();
const shranjevanjeMapa = path.join(__dirname, 'nalozeneDatoteke');
const priljubljeneDatotekePath = path.join(__dirname, 'priljubljene.json');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/files', (req, res) => {
    fs.readdir(shranjevanjeMapa, { withFileTypes: true }, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Napaka pri branju datotek' });
        }

        let fileList = files.map(file => {
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

app.delete('/api/delete/:filename', (req, res) => {
    const filename = decodeURIComponent(req.params.filename);
    const filePath = path.join(shranjevanjeMapa, filename);
    console.log('asds');
    fs.rm(filePath, { recursive: true, force: true }, (err) => {
        if (err) {
            console.log('Napaka');
            return res.status(500).json({ error: `Napaka pri brisanju datoteke: ${err.message}` });
        }
        res.sendStatus(204);
    });
});


const storageFile = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, shranjevanjeMapa);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const storageFolder = multer.diskStorage({
    destination: (req, file, cb) => {
        const imeMape = req.body.mapa;
        const cilj = path.join(shranjevanjeMapa, imeMape);
        fs.mkdirSync(cilj, { recursive: true });
        cb(null, cilj);
    },
    filename: (req, file, cb) => {
        const relativePath = file.originalname.replace(/^.*[\\\/]/, '');
        cb(null, relativePath);
    }
});

const nalaganjeDatotek = multer({ storage: storageFile });
const nalaganjeMap = multer({ storage: storageFolder });

app.post('/uploadFile', nalaganjeDatotek.array('datoteka'), (req, res) => {
    res.sendStatus(204);
});

app.post('/uploadFolder', nalaganjeMap.array('datoteka'), (req, res) => {
    res.sendStatus(204);
});

app.get('/downloadFolder/:folderName', (req, res) => {
    const imeMape = req.params.folderName;
    const potMape = path.join(shranjevanjeMapa, imeMape);
    const archive = archiver('zip', { zlib: { level: 9 } });
    const zipIme = `${imeMape}.zip`;
    res.attachment(zipIme);

    archive.pipe(res);
    archive.directory(potMape, false);
    archive.finalize();
});

app.use('/nalozeneDatoteke', express.static(shranjevanjeMapa));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Spletna stran je na http://localhost:${PORT}`);
});