/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */


import { handleStatBoy, handleStatGen } from "./statsHandlers.js";
import { handleGeminiResponse } from "./aiHandlers.js";

import { signatureRequired } from "./security.js";
import { getStaffNameByNumber, getUserPhoneNumberInSession, isPegawai, isPegawaiPhoneNumberInSession } from "./func.js";
import { MAX_MESSAGES_PER_MINUTE, SPAM_THRESHOLD, HOME_MESSAGE, BACK_ONLINE, WRONG_COMMAND, OPTION_ONE, BACK_TO_MENU, OPTION_TWO, OPTION_AI, OPTION_FOUR, APP, VALID_OPTIONS, WEBHOOK_VERIFY_TOKEN, GRAPH_API_TOKEN, PORT_NODE, SESSION_STATUS, PEGAWAI_NUMBERS, CONNECTED_WITH_PEGAWAI, SESSION_LIMIT, NO_AVAILABLE_PEGAWAI, UNSUPPORTED_TYPE_MESSAGE, SESSION_EXPIRED_MESSAGE, SESSION_QNA_EXPIRED_MESSAGE, BOT_ERROR } from "./const.js";
import axios from 'axios';
import express from 'express';


// Middleware
// Middleware to parse JSON payloads
APP.use(express.json());
// Inisialisasi array availablePegawai dengan nomor pegawai
let availablePegawai = PEGAWAI_NUMBERS.map(pegawai => pegawai.number);
// Inisialisasi Online Time
let serverOnlineTime = 0;
// Simpan status pengguna yang sudah menerima balasan
// Ini untuk mengakali jika whatsapp mengirim webhook dari pesan2 lama yg dikirim user sebelum server aktif
// sebenarnya ada di dokumentasi tetapi untuk kemudahan dilakukan cara ini meskipun masih terdapat flaws karena webhook kadang memiliki delay yg lama
let repliedUsers = {};
let userActivity = {}; // To track user activity and warnings

// /**
//  * Handle spam protection for a given user by monitoring their message activity.
//  * This function keeps track of the number of messages a user sends within a given time window
//  * and applies spam protection rules accordingly.
//  *
//  * @param {string} businessPhoneNumberId - The phone number of the WhatsApp Business Account (WABA).
//  * @param {string} recipient - The phone number of the user who sent the message.
//  * @param {Object} [messages] - The message object containing message details. If null or undefined, no action is taken.
//  * @returns {Promise<boolean>} - Returns true if the user is blocked, false otherwise.
//  */
// async function handleSpamProtection(businessPhoneNumberId, recipient, messages) {
//   if (!messages) {
//     console.log("No messages found, skipping spam protection.");
//     return false;
//   }

//   // Initialize user data if not present
//   if (!userActivity[recipient]) {
//     userActivity[recipient] = { messageCount: 0, lastMessageTime: Date.now(), warnings: 0 };
//     console.log(`Initialized user data for ${recipient}.`);
//   }

//   const currentTime = Date.now();
//   const userData = userActivity[recipient];

//   // Reset message count if more than a minute has passed
//   if (currentTime - userData.lastMessageTime > 60000) {  // 1 minute in milliseconds
//     userData.messageCount = 0;
//     console.log(`Reset message count for ${recipient} due to inactivity.`);
//   }

//   userData.messageCount += 1;
//   userData.lastMessageTime = currentTime;

//   console.log(`User ${recipient} has sent ${userData.messageCount} messages.`);

//   // Check for spam behavior
//   if (userData.messageCount > MAX_MESSAGES_PER_MINUTE) {
//     userData.warnings += 1;
//     userData.messageCount = 0; // Reset the message count after a warning

//     console.log(`User ${recipient} exceeded message limit. Warnings: ${userData.warnings}`);

//     if (userData.warnings >= SPAM_THRESHOLD) {
//       // Block user or take action (e.g., notify admin)
//       try {
//         await sendWhatsAppMessage(businessPhoneNumberId, recipient, "You have been blocked due to excessive messaging.");
//         console.log(`User ${recipient} has been blocked.`);
//       } catch (error) {
//         console.error("Failed to send block message:", error);
//       }
//       // Optionally, add the user to a blacklist
//       return true;
//     } else {
//       // Send warning message
//       try {
//         await sendWhatsAppMessage(businessPhoneNumberId, recipient, `Warning: Please reduce the number of messages. You have ${SPAM_THRESHOLD - userData.warnings} warnings left.`);
//         console.log(`Warning sent to user ${recipient}.`);
//       } catch (error) {
//         console.error("Failed to send warning message:", error);
//       }
//     }
//   }

//   return false;
// }



// /**
//  * Mengirim pesan WhatsApp menggunakan Graph API Facebook.
//  * Pesan dapat dikirim sebagai balasan untuk pesan tertentu dengan menyediakan ID pesan konteks.
//  * Hanya menerima type text
//  * 
//  * @async
//  * @function
//  * @name sendWhatsAppMessage
//  *
//  * @param {string} businessPhoneNumberId - ID nomor telepon bisnis yang digunakan untuk mengirim pesan.
//  * @param {string} recipient - Nomor telepon penerima pesan.
//  * @param {string} text - Teks pesan yang akan dikirim.
//  * @param {string} [context_message_id=null] - (Opsional) ID pesan konteks untuk mengirim balasan (reply).
//  *
//  * @example
//  * sendWhatsAppMessage('123456789', 'recipient123', 'Hello, world!');
//  * sendWhatsAppMessage('123456789', 'recipient123', 'This is a reply', 'message_id_456');
//  *
//  * @returns {Promise<void>}
//  */
// async function sendWhatsAppMessage(businessPhoneNumberId, recipient, text, context_message_id = null) {
//   const url = `https://graph.facebook.com/v20.0/${businessPhoneNumberId}/messages`;
//   const headers = {
//     Authorization: `Bearer ${GRAPH_API_TOKEN}`,
//     "Content-Type": "application/json",
//   };
//   const data = {
//     messaging_product: "whatsapp",
//     to: recipient,
//     text: { body: text },
//   };
//   if (context_message_id) {
//     data.context = { message_id: context_message_id };
//   }

//   try {
//     await axios.post(url, data, { headers });
//     console.log("Message sent successfully:");
//   } catch (error) {
//     console.error("Error sending message:");
//     console.error(`Recipient: ${recipient}`);
//     console.error(`Message: ${text}`);
//     console.error("Error details:", error.response.data);
//   }
// }


// /**
//  * Marks a WhatsApp message as seen using the Facebook Graph API.
//  * 
//  * @param {string} businessPhoneNumberId - The ID of the business phone number.
//  * @param {string} messageId - The ID of the message to mark as seen.
//  * @returns {Promise<void>} - A promise that resolves when the message is marked as seen.
//  * 
//  * @throws {Error} - Throws an error if the request to mark the message as seen fails.
//  */
// async function markMessageAsSeen(businessPhoneNumberId, messageId) {
//   // Construct the URL for the API request
//   const url = `https://graph.facebook.com/v20.0/${businessPhoneNumberId}/messages`;

//   // Set the request headers
//   const headers = {
//     Authorization: `Bearer ${GRAPH_API_TOKEN}`,  // Authorization token
//     "Content-Type": "application/json",  // Content type of the request
//   };

//   // Define the request payload
//   const data = {
//     messaging_product: "whatsapp",
//     status: "read",
//     message_id: messageId,  // ID of the message to mark as seen
//   };

//   try {
//     // Send a POST request to mark the message as seen
//     await axios.post(url, data, { headers });
//     console.log("Message marked as seen successfully.");
//   } catch (error) {
//     // Log an error if the request fails
//     console.error("Error marking message as seen:", error.response?.data || error.message);
//   }
// }

// // TODO typing indicator
// async function showTypingIndicator() {
// }


// /**
//  * Menangani kedaluwarsa sesi untuk penerima tertentu.
//  * Menghapus status sesi dari objek SESSION_STATUS dan mengirim pesan pemberitahuan sesi kedaluwarsa melalui WhatsApp.
//  *
//  * @async
//  * @function
//  * @name handleSessionExpiration
//  * 
//  * @param {string} business_phone_number_id - ID nomor telepon bisnis yang digunakan untuk mengirim pesan.
//  * @param {string} recipient - Penerima yang sesi-nya telah berakhir.
//  *
//  * @example
//  * handleSessionExpiration('123456789', 'recipient123');
//  *
//  * @returns {Promise<void>}
//  */
// async function handleSessionExpiration(businessPhoneNumberId, recipient) {

//   if (SESSION_STATUS[recipient]) {
//     await sendWhatsAppMessage(businessPhoneNumberId, recipient, SESSION_EXPIRED_MESSAGE);
//     if (SESSION_STATUS[recipient].pegawaiPhoneNumber) {
//       await sendWhatsAppMessage(businessPhoneNumberId, SESSION_STATUS[recipient].pegawaiPhoneNumber, SESSION_QNA_EXPIRED_MESSAGE);
//       availablePegawai.push(SESSION_STATUS[recipient].pegawaiPhoneNumber);
//     }
//   }
//   delete SESSION_STATUS[recipient];
// }



/**
 * Memeriksa kedaluwarsa sesi untuk setiap penerima dalam objek SESSION_STATUS.
 * Jika sesi telah tidak aktif selama lebih dari 3 menit (180000 ms), sesi akan dianggap kedaluwarsa dan
 * fungsi handleSessionExpiration akan dipanggil untuk menangani kedaluwarsa sesi tersebut.
 *
 * @function
 * @name checkSessionExpiration
 *
 * @example
 * checkSessionExpiration();
 *
 * @returns {void}
 */
function checkSessionExpiration() {
  const currentTime = Date.now();
  for (const recipient in SESSION_STATUS) {
    if ((currentTime - SESSION_STATUS[recipient].lastActive) > SESSION_LIMIT) {
      handleSessionExpiration(SESSION_STATUS[recipient].businessPhoneNumberId, recipient);
    }
  }
}


/**
 * Memanggil fungsi checkSessionExpiration setiap 60 detik (60000 ms) untuk memeriksa dan menangani
 * kedaluwarsa sesi secara berkala.
 *
 * @example
 * setInterval(checkSessionExpiration, 60000);
 *
 * @returns {void}
 */
setInterval(checkSessionExpiration, 60000);


/**
 * Endpoint webhook untuk menangani pesan masuk dari WhatsApp.
 * Mengelola sesi pengguna, merespon pesan berdasarkan input pengguna, dan mengirim pesan balik ke pengguna.
 *
 * @async
 * @function
 * @name /webhook
 * 
 * @param {Object} req - Objek permintaan dari Express, berisi pesan yang diterima dari webhook.
 * @param {Object} res - Objek respons dari Express.
 *
 * @example
 * app.post("/webhook", async (req, res) => { ... });
 *
 * @returns {void}
 */
APP.post("/webhook", async (req, res) => {
  // Mengambil entri pertama dari body permintaan
  const entry = req.body.entry?.[0];
  if (!entry) {
    res.sendStatus(400); // Mengirim status 400 jika entry tidak ada
    return;
  }
  // Mengambil perubahan pertama dari entri
  const changes = entry.changes?.[0];
  if (!changes) {
    res.sendStatus(400); // Mengirim status 400 jika perubahan tidak ada
    return;
  }
  // Mengambil nilai dari webhook
  const value = changes.value;
  const businessPhoneNumberId = value.metadata?.phone_number_id; // Mengambil ID nomor telepon bisnis
  const messages = value.messages?.[0]; // Mengambil pesan pertama dari nilai
  const statuses = value.statuses?.[0]; // Mengambil status pertama dari nilai
  const errors = value.errors?.[0]; // Mengambil error pertama dari nilai
  const messageTimestamp = messages?.timestamp; // Mengambil timestamp pesan
  const userPhoneNumber = messages?.from || statuses?.recipient_id; // Mengambil nomor telepon pengguna bot dari pesan atau status
  const isBlocked = await handleSpamProtection(businessPhoneNumberId, userPhoneNumber, messages);
  let responseText = "";
  let isBroadcast = false; // Default to false unless a broadcast is initiated

  // Handle error
  if (errors) {
    await sendWhatsAppMessage(businessPhoneNumberId, userPhoneNumber, BOT_ERROR);
    return res.sendStatus(200);
  }

  // Handle spam protection
  if (isBlocked) {
    return res.sendStatus(200);
  }

  // Pastikan bahwa messages dan interactive.button_reply ada
  if (messages?.interactive?.button_reply) {
    const { id: buttonId } = messages.interactive.button_reply;

    // Ekstrak ID unik dari ID tombol
    const uniqueId = buttonId.split('_')[1];

    // Log ID tombol dan ID unik
    console.log(`Button ID: ${buttonId}`);
    console.log(`Extracted Unique ID: ${uniqueId}`);

    // Perbarui status sesi untuk pengguna
    SESSION_STATUS[uniqueId] = {
      lastActive: Date.now(),
      optionSession: "4",
      businessPhoneNumberId: businessPhoneNumberId,
      pegawaiPhoneNumber: userPhoneNumber
    };

    // Hapus nomor staf dari daftar staf yang tersedia
    availablePegawai = availablePegawai.filter(number => number !== userPhoneNumber);

    // Log status sesi yang diperbarui dan daftar staf yang tersedia
    console.log(`Updated session status for user ID ${uniqueId}:`, SESSION_STATUS[uniqueId]);
    console.log(`Updated available staff list:`, availablePegawai);

    // Coba kirim pesan konfirmasi ke pengguna
    try {
      await sendWhatsAppMessage(businessPhoneNumberId, uniqueId, `${CONNECTED_WITH_PEGAWAI}${getStaffNameByNumber(userPhoneNumber)}`);
      console.log(`Confirmation message sent to user ID ${uniqueId}.`);
    } catch (error) {
      console.error(`Failed to send confirmation message to user ID ${uniqueId}:`, error.message);
    }

    // Respon ke permintaan HTTP dengan status sukses
    res.sendStatus(200);
    return;
  }

  // Menangani pesan teks yang diterima
  if (messages && messages.timestamp) {
    await markMessageAsSeen(businessPhoneNumberId, messages.id);
    // Handle unsupported message types
    if (messages?.type && messages.type !== "text") {
      // Mengirim pesan balasan untuk jenis pesan yang tidak didukung
      await sendWhatsAppMessage(businessPhoneNumberId, userPhoneNumber, UNSUPPORTED_TYPE_MESSAGE);
      if (!(SESSION_STATUS[userPhoneNumber])) {
        await sendWhatsAppMessage(businessPhoneNumberId, userPhoneNumber, HOME_MESSAGE);
      }
      res.sendStatus(200);
      return
    }
    // TODO await showTypingIndicator());
  } else if (statuses && statuses.timestamp) {
    // do nothing
    res.sendStatus(200);
    return
  } else {
    // Menangani payload webhook yang tidak dikenali (not needed)
    res.sendStatus(200);
    return
  }



  { /** Handle message sent when server offline
  * It Just weird cause webhook not coming at the right order because whatsapp internal optimization or maybe this code need a lot of improvement :v
  */
    // if ((messageTimestamp < serverOnlineTime) && !(userPhoneNumber in repliedUsers) && !isPegawai(userPhoneNumber)) {
    //   // Mengirim pesan balasan dari pesan yang dikirim ketika server offline
    //   await sendWhatsAppMessage(businessPhoneNumberId, userPhoneNumber, BACK_ONLINE, null);
    //   await sendWhatsAppMessage(businessPhoneNumberId, userPhoneNumber, HOME_MESSAGE);
    //   SESSION_STATUS[userPhoneNumber] = { lastActive: Date.now(), optionSession: null, businessPhoneNumberId: businessPhoneNumberId, pegawaiPhoneNumber: null };
    //   // Tandai pengguna sudah menerima balasan
    //   repliedUsers[userPhoneNumber] = true;
    //   res.sendStatus(200);
    //   return
    // }
  }

  // Handle First Message
  if ((messageTimestamp > serverOnlineTime) && (!(SESSION_STATUS[userPhoneNumber]))) {
    const userMessage = messages.text.body.trim().toLowerCase();
    // menangani pesan yang dikirim pegawai agar diteruskan ke penanya, percakapan pegawai sbg CS akan selalu dianggap first message karena sesi pegawai dgn bot tdk dibuat
    if (isPegawaiPhoneNumberInSession(SESSION_STATUS, userPhoneNumber)) {
      responseText = userMessage
      await sendWhatsAppMessage(businessPhoneNumberId, getUserPhoneNumberInSession(SESSION_STATUS, userPhoneNumber), responseText);
      res.sendStatus(200);
      return
    }
    SESSION_STATUS[userPhoneNumber] = { lastActive: Date.now(), optionSession: "0", businessPhoneNumberId: businessPhoneNumberId };
    await sendWhatsAppMessage(businessPhoneNumberId, userPhoneNumber, HOME_MESSAGE);
    res.sendStatus(200);
    return;
  }

 // Check if message is valid and the user is in session
 if (messageTimestamp > serverOnlineTime && messages && SESSION_STATUS[userPhoneNumber]) {
  if (messages.text) {
    const userMessage = messages.text.body.trim().toLowerCase();
    const isValidOption = VALID_OPTIONS.includes(userMessage);
    const { optionSession } = SESSION_STATUS[userPhoneNumber];
    SESSION_STATUS[userPhoneNumber].lastActive = Date.now();
    // Handle returning to the home menu
    if (userMessage === "0") {
      SESSION_STATUS[userPhoneNumber] = {
        lastActive: Date.now(),
        optionSession: "0",
        businessPhoneNumberId: businessPhoneNumberId
      };
      responseText = HOME_MESSAGE;
    } 
    // Handle messages based on the current session option
    else if (optionSession && optionSession != "0") {
      if (optionSession === "1") {
        responseText = await handleStatBoy(userMessage);
      } else if (optionSession === "3") {
        responseText = await handleGeminiResponse(userMessage);
      } else if (optionSession === "4") {
        await sendMessageToPegawai(businessPhoneNumberId, SESSION_STATUS[userPhoneNumber].pegawaiPhoneNumber, userMessage, userPhoneNumber);
        res.sendStatus(200);
        return;
      }
    } 
    // Handle new menu options
    else if (isValidOption) {
      SESSION_STATUS[userPhoneNumber].optionSession = userMessage;
      if (userMessage === "1") {
        responseText = OPTION_ONE + BACK_TO_MENU;
      } else if (userMessage === "3") {
        responseText = OPTION_AI + BACK_TO_MENU;
      } else if (userMessage === "4") {
        responseText = OPTION_FOUR + BACK_TO_MENU;
        isBroadcast = await pegawaiBroadcast(businessPhoneNumberId, availablePegawai, userMessage, userPhoneNumber);
      }
    } 
    // Handle invalid commands
    else {
      responseText = WRONG_COMMAND + HOME_MESSAGE;
      SESSION_STATUS[userPhoneNumber] = {
        ...SESSION_STATUS[userPhoneNumber],
        lastActive: Date.now(),
        optionSession: "0"
      };
    }

    // Send the response message to the user
    await sendWhatsAppMessage(businessPhoneNumberId, userPhoneNumber, responseText);
    
    // If broadcasting was not successful, inform the user and reset the session
    if (!isBroadcast && userMessage === "4") {
      await sendWhatsAppMessage(businessPhoneNumberId, userPhoneNumber, NO_AVAILABLE_PEGAWAI + HOME_MESSAGE);
      SESSION_STATUS[userPhoneNumber] = {
        ...SESSION_STATUS[userPhoneNumber],
        lastActive: Date.now(),
        optionSession: "0"
      };
    }

    res.sendStatus(200);
    return;
  }
}
});



/**
 * Endpoint untuk verifikasi webhook dari WhatsApp.
 * Memverifikasi token dan mode yang dikirim oleh WhatsApp untuk memastikan keabsahan webhook.
 *
 * @function
 * @name /webhook
 *
 * @param {Object} req - Objek permintaan dari Express, berisi parameter query untuk verifikasi.
 * @param {Object} res - Objek respons dari Express.
 *
 * @example
 * app.get('/webhook', (req, res) => { ... });
 *
 * @returns {void}
 */
APP.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  console.log(`mode: ${mode}`);
  console.log(`token: ${token}`);
  console.log(`challenge: ${challenge}`);

  if (mode && token) {
    if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
      console.log('Webhook verification successful');
      res.status(200).send(challenge);
    } else {
      console.log('Webhook verification failed');
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

APP.listen(PORT_NODE, () => {
  const date = new Date(); // Current date and time
  const unixTimestampInSeconds = Math.floor(date.getTime() / 1000);
  serverOnlineTime = unixTimestampInSeconds;
  console.log(`Server Online Time: ${serverOnlineTime}`);
  console.log(`Server is listening on port: ${PORT_NODE}`);
});