import { channel } from "diagnostics_channel";
import fs from "fs";
import fetch from "node-fetch";
import { text } from "stream/consumers";
import { client, TelegramClient  } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

const apiId = 123456;
const apiHash = "123456abcdfg";
const ownerId = 1842794304;
let clients = [];
let bio = "@TICCED"; 
let name = "TICCED";
let rps = (clients.length / 900);
let claimIn = 'acc';

fs.readFile("config.json", "utf8", async (err, data) => {

    if (err) {
        console.error("Error reading file 'config.json':", err.message);
        return;
    }
    
    try {
        const json = JSON.parse(data);
        const token = json.token;

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
                        
                        try {
                            const result = await client.invoke(new Api.channels.CreateChannel({
                                title: name,
                                about: bio,
                                geoPoint: null,
                                address: null,
                                participants: [],
                            }));
                            const channelId = result.chats[0].id;
                            client.channelId = channelId;

                            clients.push(client);
                            console.error(err);
                            
                        } catch (e) {

                            client.channelId = null;
                            clients.push(client);
                        }
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
                            console.log(update);
                            
                            if (update.message) {
                                const chatId = update.message.chat.id;
                                const text = update.message.text;

                                console.log(`Received message: "${text}" from chat ID: ${chatId}`);

                                if(text === '/start') {
                                    const acc = (claimIn === 'acc') ? 'Account 📍' : 'Account';
                                    const ch = (claimIn === 'ch') ? 'Channel 📍' : 'Channel';

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
                                                        callback_data: 'setBio'
                                                    },
                                                    {
                                                        text: 'SET NAME',
                                                        callback_data: 'setName'
                                                    }
                                                ],
                                                [
                                                    {
                                                        text: 'SET CLICKS LIMIT - ' + rps,
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
                                                        text: acc,
                                                        callback_data: 'claimAccount'
                                                    },
                                                    {
                                                        text: ch,
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

                            if(update.callback_query) {
                                const chatId = update.callback_query.message.chat.id;
                                const messageId = update.callback_query.message.message_id;
                                const data = update.callback_query.data;

                                if(data === 'setBio') {
                                    await bot(token, 'editMessageCaption', {
                                        chat_id: chatId,
                                        caption: '*Pls send new bio now.*',
                                        parse_mode: 'markdown',
                                        message_id: messageId,
                                        reply_markup: JSON.stringify({
                                            inline_keyboard: [
                                                [
                                                    {
                                                        text: 'CANCEL',
                                                        callback_data: 'cancel'
                                                    }
                                                ]
                                            ]
                                        })
                                    });

                                    let loop = true;
                                    while (loop) {
                                        const updates = await bot(token, 'getUpdates', {
                                            offset: lastUpdateId + 1,
                                            timeout: 30,
                                        });
                                    
                                        if (updates && updates.ok && updates.result.length > 0) {
                                            for (const update of updates.result) {
                                                lastUpdateId = update.update_id;
                                    
                                                if (update.message) {
                                                    const text = update.message.text;
                                                    const chatId = update.message.chat.id;
                                    
                                                    if (text !== '/start') {
                                                        await bot(token, 'sendMessage', {
                                                            chat_id: chatId,
                                                            parse_mode: 'markdown',
                                                            text: `*Your bio has been successfully updated.*`,
                                                        });
                                                        loop = false;
                                                        bio = text.trim();
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                if(data === 'setName') {
                                    await bot(token, 'editMessageCaption',{
                                        chat_id: chatId,
                                        message_id: messageId,
                                        parse_mode: 'markdown',
                                        caption: `*Pls send new name now.*`,
                                        reply_markup: JSON.stringify({
                                            inline_keyboard: [
                                                [{text: 'CANCEL', callback_data: 'cancel'}],
                                            ]
                                        })
                                    });

                                    let loop = true;
                                    while (loop) {
                                        const updates = await bot(token, 'getUpdates', {
                                            offset: lastUpdateId + 1,
                                            timeout: 30,
                                        });
                                    
                                        if (updates && updates.ok && updates.result.length > 0) {
                                            for (const update of updates.result) {
                                                lastUpdateId = update.update_id;
                                    
                                                if (update.message) {
                                                    const text = update.message.text;
                                                    const chatId = update.message.chat.id;
                                    
                                                    if (text !== '/start') {
                                                        await bot(token, 'sendMessage', {
                                                            chat_id: chatId,
                                                            parse_mode: 'markdown',
                                                            text: `*Your name has been successfully updated.*`,
                                                        });
                                                        loop = false;
                                                        name = text.trim();
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                if(data === 'setClickLimit') {
                                    await bot(token, 'editMessageCaption',{
                                        chat_id: chatId,
                                        message_id: messageId,
                                        parse_mode: 'markdown',
                                        caption: `*Pls send new click limit now.*`,
                                        reply_markup: JSON.stringify({
                                            inline_keyboard: [
                                                [{text: 'CANCEL', callback_data: 'cancel'}],
                                            ]
                                        })
                                    });

                                    let loop = true;
                                    while (loop) {
                                        const updates = await bot(token, 'getUpdates', {
                                            offset: lastUpdateId + 1,
                                            timeout: 30,
                                        });
                                    
                                        if (updates && updates.ok && updates.result.length > 0) {
                                            for (const update of updates.result) {
                                                lastUpdateId = update.update_id;
                                    
                                                if (update.message) {
                                                    const text = update.message.text;
                                                    const chatId = update.message.chat.id;
                                                
                                                    if (text !== '/start') {
                                                        const trimmedText = text.trim();
                                                
                                                        if (!isNaN(trimmedText) && Number.isInteger(Number(trimmedText))) {
                                                            await bot(token, 'sendMessage', {
                                                                chat_id: chatId,
                                                                parse_mode: 'markdown',
                                                                text: `*Click limit has been successfully updated.*`,
                                                            });
                                                            loop = false;
                                                            rps = Number(trimmedText);
                                                        } else {
                                                            await bot(token, 'sendMessage', {
                                                                chat_id: chatId,
                                                                parse_mode: 'markdown',
                                                                text: `*Please send a valid number.*`,
                                                            });
                                                        }
                                                    }
                                                }                                                
                                            }
                                        }
                                    }
                                }
                                if(data === 'claimAccount') {
                                    claimIn = 'acc';
                                    
                                    const acc = (claimIn === 'acc') ? 'ACCOUNT 📍' : 'ACCOUNT';
                                    const ch = (claimIn === 'ch') ? 'CHANNEL 📍' : 'CHANNEL';

                                    bot(token, 'editMessageCaption',{
                                        chat_id: chatId,
                                        message_id: messageId,
                                        caption: '*Hey, sir! Please use the bot through the panel.*\n_By: @TICCED_',
                                        parse_mode: 'markdown',
                                        reply_markup: JSON.stringify({
                                            inline_keyboard: [
                                                [
                                                    {
                                                        text: 'SET BIO',
                                                        callback_data: 'setBio'
                                                    },
                                                    {
                                                        text: 'SET NAME',
                                                        callback_data: 'setName'
                                                    }
                                                ],
                                                [
                                                    {
                                                        text: 'SET CLICKS LIMIT - ' + rps,
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
                                                        text: acc,
                                                        callback_data: 'claimAccount'
                                                    },
                                                    {
                                                        text: ch,
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
                                if(data === 'claimChannel') {
                                    claimIn = 'ch';

                                    const acc = (claimIn === 'acc') ? 'ACCOUNT 📍' : 'ACCOUNT';
                                    const ch = (claimIn === 'ch') ? 'CHANNEL 📍' : 'CHANNEL';

                                    bot(token, 'editMessageCaption',{
                                        chat_id: chatId,
                                        message_id: messageId,
                                        caption: '*Hey, sir! Please use the bot through the panel.*\n_By: @TICCED_',
                                        parse_mode: 'markdown',
                                        reply_markup: JSON.stringify({
                                            inline_keyboard: [
                                                [
                                                    {
                                                        text: 'SET BIO',
                                                        callback_data: 'setBio'
                                                    },
                                                    {
                                                        text: 'SET NAME',
                                                        callback_data: 'setName'
                                                    }
                                                ],
                                                [
                                                    {
                                                        text: 'SET CLICKS LIMIT - ' + rps,
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
                                                        text: acc,
                                                        callback_data: 'claimAccount'
                                                    },
                                                    {
                                                        text: ch,
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

let clicks = 0;
let totalTime = 0;

async function claim(chatId, token, clients, username) {
    let isRunning = true;
    checkUsername(username);

    while (isRunning) {
        for(client of clients){
            try {
                if (claimIn === 'acc') {
                    await client.invoke(
                        new Api.account.UpdateUsername({
                          username: username,
                        })
                      );

                    console.log(`User name claimed successfully!`);
                    isRunning = false;
                    return;
                } else if (claimIn === 'ch') {
                    const channelId = client.channelId;
                    if (channelId) {
                        try {
                            await client.invoke(
                                new Api.channels.UpdateUsername({
                                  channel: channelId,
                                  username: username,
                                })
                              );

                            console.log(`User name claimed successfully!`);
                            isRunning = false;
                            return;
                        } catch (error) {
                            const errMessage = error.errorMessage;
                            if(errMessage === 'USERNAME_OCCUPIED') {

                                rps++;
                            } else {
                                
                                bot(token, 'sendMessage', {
                                    chat_id: chatId,
                                    parse_mode: 'markdown',
                                    text: `*${error}*`,
                                });
                            }
                        }
                    }
                    
                }
            } catch (err) {
                console.error(err);
            }
        }
    }
}