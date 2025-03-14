import {fetchMediaFiles} from "./dropbox-handler.js";
import {io} from "../server.js";

io.on("connection", (socket) => {
    console.log("Neuer Client verbunden:", socket.id);

    const sendDiashow = async () => {
        try {
            const mediaFiles = await fetchMediaFiles();
            if (mediaFiles.length > 0) {
                let index = 0;
                setInterval(() => {
                    if (index >= mediaFiles.length) index = 0;
                    socket.emit("diashow", mediaFiles[index]);
                    index++;
                }, 5000);
            } else {
                socket.emit("diashow", { error: "Keine Medien verfügbar" });
            }
        } catch (error) {
            console.error("Fehler beim Laden der Diashow:", error);
            socket.emit("diashow", { error: "Fehler beim Laden der Medien" });
        }
    };

    sendDiashow();

    socket.on("disconnect", () => {
        console.log("Client getrennt:", socket.id);
    });
});