import dropBoxV2Api from 'dropbox-v2-api';
import { getDropboxAccessToken } from "./dropbox-token-handler.js";

export const getDropboxInstance = async () => {
    const token = await getDropboxAccessToken();
    return dropBoxV2Api.authenticate({ token });
};

const fetchMediaFiles = () => {
    return new Promise(async (resolve, reject) => {
        const dropbox = await getDropboxInstance();

        dropbox({
            resource: 'files/list_folder',
            parameters: { path: "/uploads", recursive: false }
        }, async (err, result) => {
            if (err && err?.error?.['.tag'] === 'expired_access_token') {
                console.warn('Access-Token abgelaufen, wird erneuert...');
                const { resetDropboxAccessToken } = await import('./dropbox-token-handler.js');
                resetDropboxAccessToken();

                const dropboxNew = await getDropboxInstance();

                return dropboxNew({
                    resource: 'files/list_folder',
                    parameters: { path: "/uploads", recursive: false }
                }, async (err2, result2) => {
                    if (err2) {
                        console.error('Dropbox Fehler nach Token-Erneuerung:', err2);
                        return reject(err2);
                    }
                    return handleMediaFiles(result2, dropboxNew, resolve, reject);
                });
            }

            if (err) {
                console.error('Dropbox Fehler:', err);
                return reject(err);
            }

            return handleMediaFiles(result, dropbox, resolve, reject);
        });
    });
};

const handleMediaFiles = async (result, dropbox, resolve, reject) => {
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    const mediaFiles = result.entries.filter(file =>
        file[".tag"] === "file" &&
        validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    );

    if (mediaFiles.length === 0) {
        return resolve([]);
    }

    const mediaLinks = await Promise.all(mediaFiles.map(file => {
        return new Promise((res) => {
            dropbox({
                resource: 'files/get_temporary_link',
                parameters: { path: file.path_lower }
            }, (err, tempLinkResult) => {
                if (err) {
                    console.error(`Fehler beim Abrufen des temporären Links für ${file.name}:`, err);
                    return res(null);
                }
                res({
                    name: file.name,
                    src: tempLinkResult.link,
                    size: file.size || 0,
                });
            });
        });
    }));

    resolve(mediaLinks.filter(link => link !== null));
};

let mediaFiles = [];
let index = 0;
let interval;
let interval_ReloadMediaFiles;

export function updateMediaFiles() {
    return fetchMediaFiles().then(files => {
        mediaFiles = files;

        console.log("Diashow geupdated, gesamt:", mediaFiles.length, "Bilder");
        return mediaFiles;
    }).catch(error => {
        console.error("Fehler beim Aktualisieren der Medien:", error);
        return [];
    });
}

function getStatistics() {
    return {
        totalFiles: mediaFiles.length,
        totalSize: mediaFiles.reduce((total, file) => total + (file.size || 0), 0),
        currentIndex: index,
        currentFile: mediaFiles[index] || null
    };
}

export function initSocketServer(io) {
    const startDiashow = async () => {
        try {
            console.log("Starte Diashow...");
            mediaFiles = await fetchMediaFiles();

            // Stoppe alte Intervals falls vorhanden
            if (interval) clearInterval(interval);
            if (interval_ReloadMediaFiles) clearInterval(interval_ReloadMediaFiles);

            // Media Files alle 60 Sekunden neu laden
            const reloadMediaFiles = () => {
                interval_ReloadMediaFiles = setInterval(async () => {
                    console.log("Lade Media Files neu...");
                    mediaFiles = await fetchMediaFiles();
                }, 60000);
            }

            if (mediaFiles.length === 0) {
                console.error("Keine Medien verfügbar");
                return;
            }

            console.log("Diashow gestartet, gesamt:", mediaFiles.length, "Bilder");

            // Erstes Bild sofort senden
            io.emit("diashow", mediaFiles[index]);
            io.emit("mediaFiles", mediaFiles);
            io.emit("statistics", getStatistics());

            // Diashow Interval starten - WICHTIG: Nach dem ersten emit!
            const startSlideshow = () => {
                interval = setInterval(() => {
                    console.log(`Slideshow tick - Index: ${index}, Total: ${mediaFiles.length}`);

                    index = index + 1;
                    if (index >= mediaFiles.length) {
                        index = 0;
                    }

                    console.log(`Sende Bild ${index + 1}/${mediaFiles.length}: ${mediaFiles[index]?.name}`);

                    io.emit("diashow", mediaFiles[index]);
                    io.emit("mediaFiles", mediaFiles);
                    io.emit("statistics", getStatistics());
                }, 10000);
            };

            // Slideshow nach kurzer Verzögerung starten
            setTimeout(startSlideshow, 1000);
            // Media Files neu laden
            setTimeout(reloadMediaFiles, 1000);

        } catch (error) {
            console.error("Fehler beim Laden der Diashow:", error);
        }
    };

    io.on("connection", (socket) => {
        console.log("Neuer Client verbunden:", socket.id);

        if (mediaFiles.length > 0) {
            socket.emit("diashow", mediaFiles[index]);
            socket.emit("mediaFiles", mediaFiles);
            socket.emit("statistics", getStatistics());
        } else {
            socket.emit("diashow", { error: "Keine Medien verfügbar" });
            socket.emit("mediaFiles", { error: "Keine Medien verfügbar" });
            io.emit("statistics", { error: "Keine Medien verfügbar" });
        }

        socket.on("disconnect", () => {
            console.log("Client getrennt:", socket.id);
        });
    });

    startDiashow();
}
