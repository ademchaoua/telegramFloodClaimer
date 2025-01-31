import fs from "fs";
import fetch from "node-fetch";
import { Api, TelegramClient  } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

const apiId = 123456;
const apiHash = "123456abcdfg";
const ownerId = 1349732568;
let clients = [];
let bio = "@TICCED"; 
let name = "TICCED";
let rps = 1;
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

                            console.log(channelId);

                            clients.push({
                                client: client,
                                session: session
                            });
                        } catch (e) {

                            console.error(e.message);
                            client.channelId = null;
                            clients.push({
                                client: client,
                                session: session
                            });
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

                                if(chatId === ownerId){
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
                                                        { text: 'SET BIO', callback_data: 'setBio' },
                                                        { text: 'SET NAME', callback_data: 'setName' }
                                                    ],
                                                    [
                                                        { text: 'SET CLICKS LIMIT - ' + rps, callback_data: 'setClickLimit' }
                                                    ],
                                                    [
                                                        { text: 'CLAIM IN:', callback_data: 'none' }
                                                    ],
                                                    [
                                                        { text: acc, callback_data: 'claimAccount' },
                                                        { text: ch, callback_data: 'claimChannel' }
                                                    ],
                                                    [
                                                        { text: 'STATUS', callback_data: 'status' }
                                                    ],
                                                    [
                                                        { text: 'RUN', callback_data: 'run' },
                                                        { text: 'STOP', callback_data: 'stop' }
                                                    ]
                                                ]                                            
                                            })
                                        });
                                    }
                                }
                                
                            }

                            if(update.callback_query) {
                                const chatId = update.callback_query.message.chat.id;
                                const messageId = update.callback_query.message.message_id;
                                const data = update.callback_query.data;

                                if(chatId === ownerId){
                                    if(data === 'cancel') {
                                        const acc = (claimIn === 'acc') ? 'Account 📍' : 'Account';
                                        const ch = (claimIn === 'ch') ? 'Channel 📍' : 'Channel';
    
                                        await bot(token, 'editMessageCaption',{
                                            chat_id: chatId,
                                            caption: '*Hey, sir! Please use the bot through the panel.*\n_By: @TICCED_',
                                            parse_mode: 'markdown',
                                            message_id: messageId,
                                            reply_markup: JSON.stringify({
                                                inline_keyboard: [
                                                    [
                                                        { text: 'SET BIO', callback_data: 'setBio' },
                                                        { text: 'SET NAME', callback_data: 'setName' }
                                                    ],
                                                    [
                                                        { text: 'SET CLICKS LIMIT - ' + rps, callback_data: 'setClickLimit' }
                                                    ],
                                                    [
                                                        { text: 'CLAIM IN:', callback_data: 'none' }
                                                    ],
                                                    [
                                                        { text: acc, callback_data: 'claimAccount' },
                                                        { text: ch, callback_data: 'claimChannel' }
                                                    ],
                                                    [
                                                        { text: 'STATUS', callback_data: 'status' }
                                                    ],
                                                    [
                                                        { text: 'RUN', callback_data: 'run' },
                                                        { text: 'STOP', callback_data: 'stop' }
                                                    ]
                                                ]                                            
                                            })
                                        });
                                    }
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
                                                        } else {
                                                            loop = false;
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
                                                        } else {
                                                            loop = false;
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
                                                        } else {
                                                            loop = false;
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
                                                        { text: 'SET BIO', callback_data: 'setBio' },
                                                        { text: 'SET NAME', callback_data: 'setName' }
                                                    ],
                                                    [
                                                        { text: 'SET CLICKS LIMIT - ' + rps, callback_data: 'setClickLimit' }
                                                    ],
                                                    [
                                                        { text: 'CLAIM IN:', callback_data: 'none' }
                                                    ],
                                                    [
                                                        { text: acc, callback_data: 'claimAccount' },
                                                        { text: ch, callback_data: 'claimChannel' }
                                                    ],
                                                    [
                                                        { text: 'STATUS', callback_data: 'status' }
                                                    ],
                                                    [
                                                        { text: 'RUN', callback_data: 'run' },
                                                        { text: 'STOP', callback_data: 'stop' }
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
                                                        { text: 'SET BIO', callback_data: 'setBio' },
                                                        { text: 'SET NAME', callback_data: 'setName' }
                                                    ],
                                                    [
                                                        { text: 'SET CLICKS LIMIT - ' + rps, callback_data: 'setClickLimit' }
                                                    ],
                                                    [
                                                        { text: 'CLAIM IN:', callback_data: 'none' }
                                                    ],
                                                    [
                                                        { text: acc, callback_data: 'claimAccount' },
                                                        { text: ch, callback_data: 'claimChannel' }
                                                    ],
                                                    [
                                                        { text: 'STATUS', callback_data: 'status' }
                                                    ],
                                                    [
                                                        { text: 'RUN', callback_data: 'run' },
                                                        { text: 'STOP', callback_data: 'stop' }
                                                    ]
                                                ]                                            
                                            })
                                        });
                                    }
                                    if(data === 'run') {
                                        await bot(token, 'editMessageCaption',{
                                            chat_id: chatId,
                                            parse_mode: 'markdown',
                                            caption: `*Send now the username.*`,
                                            message_id: messageId,
                                            reply_markup: JSON.stringify({
                                                inline_keyboard: [
                                                    [
                                                        {text: 'CANCEL', callback_data: 'cancel'}
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
                                                            const username = randomCase(text.toLowerCase());
                                                            await bot(token, 'sendMessage', {
                                                                chat_id: chatId,
                                                                parse_mode: 'markdown',
                                                                text: `*Username Claiming Started ⏳\n\n- Username: ${username}\n- Sessions: *\`${clients.length}\`*\n- Sleep: *\`${1000 / rps / 1000}'s\``,
                                                            });
    
                                                            claim(chatId, token, username);
                                                            loop = false;
                                                        } else {
                                                            loop = false;
                                                        }
                                                    }                                                
                                                }
                                            }
                                        }
                                    }
                                    if(data === 'stop') {
                                        isRunning = false;
                                    }
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
let isRunning;

function randomCase(text) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += Math.random() > 0.5 ? text[i].toUpperCase() : text[i].toLowerCase();
    }
    return result;
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function claim(chatId, token, username) {
    const starTime = Date.now();
    const sleepTime = 1000 / rps;

    isRunning = true;

    checkUsername(username);

    while (isRunning) {
        try {
            const promises = [];
            let floodAccounts = 0;

            for (const {client, session} of clients) {
                if(!isRunning) break;
                const promise = (async () => {
                    try {
                        if (claimIn === 'acc') {
                            await client.invoke(
                                new Api.account.UpdateUsername({ username })
                            );
                            console.log(`Username claimed successfully!`);
                            const me = await client.getMe();
                            await bot(token, 'sendVideo', {
                                chat_id: chatId,
                                parse_mode: 'markdown',
                                video: 'https://t.me/ccccdnb/3',
                                caption: `*𝙷𝙴𝙻𝙻𝙾‚ 𝚃𝙷𝙴 𝚄𝚂𝙴𝚁𝙽𝙰𝙼𝙴 𝚆𝙰𝚂 𝙴𝙰𝚂𝙸𝙻𝚈 𝚄𝚂𝙴𝙳 𝙰𝙶𝙰𝙸𝙽𝚂𝚃 𝚃𝙷𝙴𝙸𝚁 𝚆𝙸𝙻𝙻\n———————×———————\nΞ 𝚄𝚂𝙴𝚁𝙽𝙰𝙼𝙴 : @${username} ⍅\nΞ 𝙲𝙻𝙸𝙲𝙺𝚂 : ${clicks} ⍅\nΞ 𝚂𝙰𝚅𝙴 : ACCOUNT ⍅\nΞ 𝙽𝚄𝙼𝙱𝙴𝚁 : +${me.phone}\n———————×———————\nΞ 𝙱𝚈 : ⟮ @TICCED 𖤐 ⟯*`,
                            });

                            await bot(token, 'sendMessage', {
                                chat_id: chatId,
                                text: session
                            });

                            await client.invoke(
                                new Api.account.UpdateProfile({
                                  firstName: name,
                                  lastName: "",
                                  about: bio,
                                })
                              );

                            isRunning = false;
                            return;
                        }

                        if (claimIn === 'ch') {
                            const channelId = client.channelId;
                            if (channelId) {
                                await client.invoke(
                                    new Api.channels.UpdateUsername({
                                        channel: channelId,
                                        username: username,
                                    })
                                );
                            } else {
                                await client.invoke(
                                    new Api.account.UpdateUsername({ username })
                                );
                            }
                            console.log(`Username claimed successfully!`);
                            const me = await client.getMe();
                            await bot(token, 'sendVideo', {
                                chat_id: chatId,
                                video: 'https://t.me/ccccdnb/3',
                                parse_mode: 'markdown',
                                caption: `*𝙷𝙴𝙻𝙻𝙾‚ 𝚃𝙷𝙴 𝚄𝚂𝙴𝚁𝙽𝙰𝙼𝙴 𝚆𝙰𝚂 𝙴𝙰𝚂𝙸𝙻𝚈 𝚄𝚂𝙴𝙳 𝙰𝙶𝙰𝙸𝙽𝚂𝚃 𝚃𝙷𝙴𝙸𝚁 𝚆𝙸𝙻𝙻\n———————×———————\nΞ 𝚄𝚂𝙴𝚁𝙽𝙰𝙼𝙴 : @${username} ⍅\nΞ 𝙲𝙻𝙸𝙲𝙺𝚂 : ${clicks} ⍅\nΞ 𝚂𝙰𝚅𝙴 : CHANNEL ⍅\nΞ 𝙽𝚄𝙼𝙱𝙴𝚁 : +${me.phone}\n———————×———————\nΞ 𝙱𝚈 : ⟮ @TICCED 𖤐 ⟯*`,
                            });

                            await bot(token, 'sendMessage', {
                                chat_id: chatId,
                                text: session
                            });

                            await client.invoke(
                                new Api.messages.SendMessage({
                                  peer: `@${username}`,
                                  message: `𝚄𝚂𝙴𝚁𝙽𝙰𝙼𝙴 𝙲𝙻𝙰𝙸𝙼𝙴𝙳 𝚂𝚄𝙲𝙲𝙴𝚂𝚂𝙵𝚄𝙻𝙻𝚈\n𝙼𝚈 𝙲𝙷𝙰𝙽𝙽𝙴𝙻: @karrar_hunt\n𝙱𝚈: @TICCED`,
                                  randomId: BigInt(Date.now())
                                })
                              );

                              await client.invoke(
                                new Api.channels.EditTitle({
                                  channel: username,
                                  title: username,
                                })
                              );

                            isRunning = false;
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
    
                                console.log(channelId);
                            } catch (e) {
    
                                console.error(e.message);
                                client.channelId = null;
                            }
                            return;
                        }
                    } catch (error) {
                        const errMessage = error.errorMessage;
                        console.log(errMessage);
                        
                        if (errMessage === 'USERNAME_OCCUPIED') {
                            console.log(`Failed Claim Username #${clicks} try again after ${sleepTime}'ms`);
                            clicks++;
                        } else if(errMessage === 'FLOOD') {
                            floodAccounts++;
                        } else {
                            await bot(token, 'sendMessage', {
                                chat_id: chatId,
                                parse_mode: 'markdown',
                                text: `*${error}*`,
                            });
                        }
                    }
                })();
                promises.push(promise);
                await sleep(sleepTime);
            }
            await bot(token, 'sendMessage', {
                chat_id: chatId,
                parse_mode: 'markdown',
                text: `*- Total flood accounts: *\`${floodAccounts}\``
            });
        } catch (err) {
            console.error(err.message);
        }
    }
    const endTime = Date.now();
    const totalTime = endTime - starTime;

    await bot(token, 'sendMessage', {
        chat_id: chatId,
        text: `*Username Claiming Stopped 📍\n\n- Username: @${username}\n- Total Attempts: *\`${clicks}\`*\n- Rps: *\`${(clicks / totalTime / 1000).toFixed(2)}\``,
        parse_mode: 'markdown',
    });
}

async function checkUsername(username) {
    const url = `https://fragment.com/username/${username}`;
    while (true) {
        const response = await fetch(url);
        const html = await response.text();
        if(html.includes(`<span class="tm-section-header-status tm-status-taken">Taken</span>`)) {
            isRunning = false;
            return;
        }
    }
}