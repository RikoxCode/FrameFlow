import { PassThrough } from 'stream';
import dropBoxV2Api from 'dropbox-v2-api';
import { authorize } from './auth-handler.js';

// Initialize dropbox handler
export const initializeDropboxHandler = (app, baseUrl) => {
    app.get(baseUrl+'/check', (req, res) => { res.status(200).send('Server is running'); });
    app.get(baseUrl+'/images', authorize, getAllImages);
    app.post(baseUrl+'/upload', authorize, uploadFile);
};

export const uploadFile = (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).json({ error: 'No files were uploaded.' });
    }

    console.log('File uploaded:', req.files.file.name);
    console.log('File size:', req.files.file.size);

    // Check first if the file is smaller than 150MB
    if (req.files.file.size > (150 * 1024 * 1024)) {
        return res.status(400).json({ error: 'File size exceeds the limit of 150MB.' });
    }

    const dropbox = dropBoxV2Api.authenticate({
        token: process.env.DROPBOX_ACCESS_TOKEN
    });

    const file = req.files.file;
    const stream = new PassThrough();
    stream.end(file.data); // Convert Buffer to stream

    dropbox({
        resource: 'files/upload',
        parameters: {
            path: `/uploads/${file.name}`,
            mode: 'add',
            autorename: true,
            mute: false,
            strict_conflict: false
        },
        readStream: stream // Use converted stream
    }, (err, result) => {
        if (err) {
            console.error('Dropbox upload error:', err);
            if (!res.headersSent) {
                return res.status(500).json({ error: err.message });
            }
        }
        if (!res.headersSent) {
            res.status(200).json(result);
        }
    });
};

export const getAllImages = async (req, res) => {
    const dropbox = dropBoxV2Api.authenticate({
        token: process.env.DROPBOX_ACCESS_TOKEN
    });

    try {
        dropbox({
            resource: 'files/list_folder',
            parameters: { path: "/uploads", recursive: false }
        }, async (err, result) => {
            if (err) {
                console.error('Dropbox Error:', err);
                return res.status(500).send({ error: err.message });
            }

            if (!result.entries || result.entries.length === 0) {
                return res.status(404).json({ error: "Keine Dateien im 'uploads'-Ordner gefunden." });
            }

            const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov', '.avi'];
            const mediaFiles = result.entries.filter(file =>
                file[".tag"] === "file" &&
                validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
            );

            if (mediaFiles.length === 0) {
                return res.status(404).json({ error: "Keine Medien-Dateien im 'uploads'-Ordner gefunden." });
            }

            // Get or generate shared links
            const mediaLinks = await Promise.all(mediaFiles.map(async file => {
                return new Promise((resolve) => {
                    dropbox({
                        resource: 'sharing/list_shared_links',
                        parameters: { path: file.path_lower }
                    }, (err, linkResult) => {
                        if (!err && linkResult.links.length > 0) {
                            resolve({
                                name: file.name,
                                src: linkResult.links[0].url.replace("?dl=0", "?raw=1")
                            });
                        } else {
                            dropbox({
                                resource: 'sharing/create_shared_link_with_settings',
                                parameters: { path: file.path_lower }
                            }, (err, newLinkResult) => {
                                if (err) {
                                    console.error(`Fehler beim Generieren des Links für ${file.name}:`, err);
                                    resolve(null);
                                } else {
                                    resolve({
                                        name: file.name,
                                        src: newLinkResult.url.replace("?dl=0", "?raw=1")
                                    });
                                }
                            });
                        }
                    });
                });
            }));

            const filteredLinks = mediaLinks.filter(link => link !== null);
            return res.status(200).json(filteredLinks);
        });
    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ error: "Interner Serverfehler" });
    }
};