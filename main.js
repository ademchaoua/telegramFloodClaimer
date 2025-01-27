import fs from "fs";
import fetch from "node-fetch";
import { text } from "stream/consumers";
import { TelegramClient  } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

const apiId = 123456;
const apiHash = "123456abcdfg";
const ownerId = 1842794304;

fs.readFile("config.json", "utf8", async (err, data) => {

    if (err) {
        console.error("Error reading file 'config.json':", err.message);
        return;
    }

    try {
        const json = JSON.parse(data);
        const token = json.token;
        let clients = [];

        // login to sessions
        fs.readFile('sessions.txt', 'utf8', async (err, data) => {
            if (err) {
                console.error("Error reading file 'sessions.txt':", err.message);
                return;
            }
        
            try {
                const array = data.split("\n").map(item => item.trim());
                console.log(array);
                
                for (let session of array) {
                    const stringSession = new StringSession(session);
                    const client =  new TelegramClient(stringSession, apiId, apiHash, {
                        connectionRetries: 5,
                    });
                    try {
                        await client.connect();
                        await client.getMe();
                        clients.push(client);
                    } catch (err) {
                        console.error(err.message);
                        await bot(token, 'sendMessage',{
                            chat_id: ownerId,
                            text: err.message
                        });
                    }
                }
            } catch (err) {
                console.error(err.message);
                return;
            }
        });
        
        let lastUpdateId = 0;
        console.log("Bot is running...");

        // events loop
        while (true) {
            try {
                const updates = await bot(token, "getUpdates", {
                    offset: lastUpdateId + 1,
                    timeout: 30,
                });

                if (updates && updates.ok) {
                    if (updates.result.length > 0) {
                        for (const update of updates.result) {
                            lastUpdateId = update.update_id;

                            if (update.message) {
                                const chatId = update.message.chat.id;
                                const text = update.message.text;

                                console.log(`Received message: "${text}" from chat ID: ${chatId}`);

                                if(text === '/start') {
                                    await bot(token, 'sendVideo',{
                                        chat_id: chatId,
                                        video: 'https://t.me/icsq3/800',
                                        caption: '*Hey, sir! Please use the bot through the panel.*\n_By: @TICCED_',
                                        parse_mode: 'markdown',
                                        reply_markup: JSON.stringify({
                                            inline_keyboard: [
                                                [
                                                    {
                                                        text: 'SET BIO',
                                                        callback_data: 'etBio'
                                                    },
                                                    {
                                                        text: 'SET NAME',
                                                        callback_data: 'setName'
                                                    }
                                                ],
                                                [
                                                    {
                                                        text: 'SET CLICKS LIMIT',
                                                        callback_data: 'setClickLimit'
                                                    }
                                                ],
                                                [
                                                    {
                                                        text: 'CLAIM IN:',
                                                        callback_data: 'none'
                                                    }
                                                ],
                                                [
                                                    {
                                                        text: 'ACCOUNT 📍',
                                                        callback_data: 'claimAccount'
                                                    },
                                                    {
                                                        text: 'CHANNEL',
                                                        callback_data: 'claimChannel'
                                                    }
                                                ],
                                                [
                                                    {
                                                        text: 'STATUS',
                                                        callback_data: 'status'
                                                    }
                                                ],
                                                [
                                                    {
                                                        text: 'RUN',
                                                        callback_data: 'run'
                                                    },
                                                    {
                                                        text: 'STOP',
                                                        callback_data: 'stop'
                                                    }
                                                ]
                                            ]
                                        })
                                    });
                                }
                            }
                        }
                    }
                } else {
                    console.error("Error: Invalid response from Telegram API", updates);
                }
            } catch (error) {
                console.error("Error fetching updates:", error.message);
            }
        }

    } catch (err) {
        console.error(err.message);
        return;
    }
});

async function bot(token, method, data = {}) {
    const url = `https://api.telegram.org/bot${token}/${method}`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error(`Error in bot function for method '${method}':`, error.message);
        return null;
    }
}
