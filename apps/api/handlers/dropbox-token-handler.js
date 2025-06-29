import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

let accessToken = process.env.DROPBOX_ACCESS_TOKEN || null;
let refreshToken = process.env.DROPBOX_REFRESH_TOKEN || null;
let tokenExpiresAt = null;
const authorizationCode = process.env.DROPBOX_AUTHORIZATION_CODE || null;
const redirectUri = process.env.DROPBOX_REDIRECT_URI || null;

export const getDropboxAccessToken = async () => {
    const now = Date.now();

    // Wenn gültiges Access-Token vorhanden, einfach zurückgeben
    if (accessToken && tokenExpiresAt && now < tokenExpiresAt) {
        return accessToken;
    }

    // Wenn kein Refresh-Token vorhanden, aber Authorization-Code vorhanden: Tausche ihn aus
    if (!refreshToken && authorizationCode && redirectUri) {
        console.log('Kein Refresh-Token gefunden. Versuche, den Authorization-Code einzutauschen...');
        await exchangeAuthorizationCode(authorizationCode, redirectUri);
    }

    // Wenn Refresh-Token vorhanden, hole neues Access-Token
    if (refreshToken) {
        try {
            const response = await axios.post('https://api.dropboxapi.com/oauth2/token', null, {
                params: {
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
                    client_id: process.env.DROPBOX_APP_KEY,
                    client_secret: process.env.DROPBOX_APP_SECRET
                }
            });

            accessToken = response.data.access_token;
            const expiresIn = response.data.expires_in || 14400;
            tokenExpiresAt = now + expiresIn * 1000;

            console.log('Neues Dropbox Access-Token generiert (gültig für ca. 4 Stunden)');

            return accessToken;
        } catch (error) {
            console.error('Fehler beim Erneuern des Dropbox Tokens:', error.response?.data || error.message);
            throw new Error('Token-Erneuerung fehlgeschlagen');
        }
    }

    throw new Error('Kein gültiges Token verfügbar und kein gültiger Authorization-Code vorhanden.');
};

export const resetDropboxAccessToken = () => {
    accessToken = null;
    tokenExpiresAt = null;
};

/**
 * Tauscht einmalig den Authorization-Code gegen Access- und Refresh-Token.
 * Speichert die Tokens in den lokalen Variablen.
 */
const exchangeAuthorizationCode = async (code, redirectUri) => {
    try {
        const response = await axios.post('https://api.dropboxapi.com/oauth2/token', null, {
            params: {
                code,
                grant_type: 'authorization_code',
                client_id: process.env.DROPBOX_APP_KEY,
                client_secret: process.env.DROPBOX_APP_SECRET,
                redirect_uri: redirectUri
            }
        });

        accessToken = response.data.access_token;
        refreshToken = response.data.refresh_token;
        const expiresIn = response.data.expires_in || 14400;
        tokenExpiresAt = Date.now() + expiresIn * 1000;

        console.log('Authorization-Code erfolgreich eingetauscht!');
        console.log('Access-Token:', accessToken);
        console.log('Refresh-Token:', refreshToken);
        console.log('Bitte speichere den Refresh-Token dauerhaft in deiner .env!');
    } catch (error) {
        console.error('Fehler beim Austauschen des Authorization-Codes:', error.response?.data || error.message);
        throw new Error('Austausch fehlgeschlagen');
    }
};
