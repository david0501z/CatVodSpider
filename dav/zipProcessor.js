const yauzl = require('yauzl');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

async function downloadZip(zipUrl, outputPath) {
    const { execSync } = require('child_process');
    execSync(`curl -L "${zipUrl}" -o ${outputPath}`);
}

async function unzipFile(zipFilePath) {
    return new Promise((resolve, reject) => {
        const zip = yauzl.open(zipFilePath, (err) => {
            if (err) return reject(err);
            zip.on('error', (err) => reject(err));
            zip.on('entry', (entry) => {
                if (entry.fileName.endsWith('/')) {
                    zip.readEntry();
                    return;
                }
                const filePath = path.join(path.dirname(zipFilePath), entry.fileName);
                const dir = path.dirname(filePath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                const outputFile = fs.createWriteStream(filePath);
                zip.openReadStream(entry, (err, readStream) => {
                    if (err) return reject(err);
                    readStream.pipe(outputFile);
                    outputFile.on('finish', () => {
                        outputFile.close(() => zip.readEntry());
                    });
                });
            });
            zip.on('end', () => resolve());
        });
    });
}

function deleteUnwantedFiles(deletePatterns) {
    const files = fs.readdirSync('.', { recursive: true });
    files.forEach(file => {
        const filePath = path.join('.', file);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
            for (const pattern of deletePatterns) {
                if (file.match(pattern)) {
                    fs.unlinkSync(filePath);
                    break;
                }
            }
        }
    });
}

async function rezipFiles(outputZipPath) {
    const output = fs.createWriteStream(outputZipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(output);

    const files = fs.readdirSync('.', { recursive: true });
    files.forEach(file => {
        const filePath = path.join('.', file);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
            archive.file(filePath, { name: file });
        }
    });

    await archive.finalize();
}

module.exports = {
    downloadZip,
    unzipFile,
    deleteUnwantedFiles,
    rezipFiles
};
