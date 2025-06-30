import { PassThrough } from 'stream';
import dropBoxV2Api from 'dropbox-v2-api';
import { updateMediaFiles } from "./socket-handler.js";
import { getDropboxInstance } from "./socket-handler.js";

// Initialize dropbox handler
export const initializeDropboxHandler = (app, baseUrl) => {
    app.get(baseUrl+'/check', (req, res) => { res.status(200).send('Server is running'); });
    app.post(baseUrl+'/upload', uploadFile);
};

export const uploadFile = async (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).json({ error: 'No files were uploaded.' });
    }

    console.log('File uploaded:', req.files.file.name);
    console.log('File size:', req.files.file.size);

    // Check first if the file is smaller than 150MB
    if (req.files.file.size > (150 * 1024 * 1024)) {
        return res.status(400).json({ error: 'File size exceeds the limit of 150MB.' });
    }

    const dropbox = await getDropboxInstance();

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

        updateMediaFiles();

        if (!res.headersSent) {
            res.status(200).json(result);
        }
    });
};