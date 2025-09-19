/*
 * This file is part of WPPConnect.
 *
 * WPPConnect is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * WPPConnect is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with WPPConnect.  If not, see <https://www.gnu.org/licenses/>.
 */
import wppconnect from "@wppconnect-team/wppconnect";
import {
  HOME_MESSAGE,
  WRONG_COMMAND,
  BACK_TO_MENU,
  VALID_OPTIONS,
  SESSION_STATUS,
  SESSION_LIMIT,
  UNSUPPORTED_TYPE_MESSAGE,
  SESSION_EXPIRED_MESSAGE,
  SESSION_QNA_EXPIRED_MESSAGE,
  BOT_ERROR,
  BOT_NUMBER,
  BOT_NAME,
  MENU_STRUCTURE,
  NOT_IN_WORKING_HOURS,
  FOOTER,
  NO_AVAILABLE_PEGAWAI,
  app,
  PORT_NODE,
} from "./const.js";

const myTokenStore = new wppconnect.tokenStore.MemoryTokenStore();

/**
 * Menangani kedaluwarsa sesi untuk penerima tertentu.
 * Menghapus status sesi dari objek SESSION_STATUS dan mengirim pesan pemberitahuan sesi kedaluwarsa melalui WhatsApp.
 *
 * @async
 * @function
 * @name handleSessionExpiration
 *
 * @param {string} business_phone_number_id - ID nomor telepon bisnis yang digunakan untuk mengirim pesan.
 * @param {string} recipient - Penerima yang sesi-nya telah berakhir.
 *
 * @example
 * handleSessionExpiration('123456789', 'recipient123');
 *
 * @returns {Promise<void>}
 */

async function handleSessionExpiration(client, recipient) {
  const session = SESSION_STATUS[recipient];
  if (!session) return;

  if (session.optionSession === "2") {
    // --- Tahap 1: belum kasih warning pegawai
    if (!session.waitingForPegawai) {
      await sendWhatsAppMessage(client, recipient, NO_AVAILABLE_PEGAWAI + BACK_TO_MENU);

      // tandai sudah kasih warning
      SESSION_STATUS[recipient] = {
        ...SESSION_STATUS[recipient],
        client,
        waitingForPegawai: true,
        optionSession: "2",
        lastActive: Date.now(), // reset supaya tungygu lagi 5 menit
      };
      return;
    }

    // --- Tahap 2: sudah kasih warning & masih tidak ada aktivitas 5 menit lagi
    await sendWhatsAppMessage(client, recipient, SESSION_EXPIRED_MESSAGE);
    delete SESSION_STATUS[recipient];
    return;
  }

  // menu selain 2 → langsung expired
  await sendWhatsAppMessage(client, recipient, SESSION_EXPIRED_MESSAGE);
  delete SESSION_STATUS[recipient];
}

/**
 * Memeriksa kedaluwarsa sesi untuk setiap penerima dalam objek SESSION_STATUS.
 * Jika sesi telah tidak aktif selama lebih dari 5 menit (300000 ms), sesi akan dianggap kedaluwarsa dan
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
    console.log(`[SESSION] Checking expiration for ${recipient}`);
    if (currentTime - SESSION_STATUS[recipient].lastActive > SESSION_LIMIT) {
      console.log(`[SESSION] ${recipient} expired, handling...`);
      handleSessionExpiration(SESSION_STATUS[recipient].client, recipient);
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

const serverOnlineTime = Date.now() / 1000; // Current timestamp in milliseconds

// create client wpp
wppconnect
  .create({
    session: BOT_NAME,
    tokenStore: myTokenStore,
    deviceSyncTimeout: 0,
    autoClose: false, // set waktu auto stop kode pairing
    phoneNumber: BOT_NUMBER,
    catchLinkCode: (str) => {
      console.error("Code: " + str);
      // Tambahkan lebih banyak kode log jika perlu
    },
    protocolTimeout: 120000, // set waktu timeout dari proses komunikasi
    puppeteerOptions: {
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      // Tambahkan opsi puppeteer lain di sini jika diperlukan
    },
  })
  .then((client) => {
    // Tambahkan kode yang berhubungan dengan client di sini
    console.error("Client Running...");
    start(client);
  })
  .catch((error) => {
    console.error("Error:", error);
  });

async function start(client) {
  client.onMessage(async (message) => {
    if (message.isGroupMsg) return;
    if (message.timestamp < serverOnlineTime) return;

    // ✅ Abaikan pesan e2e, notifikasi, dan event tanpa body
    // if (message.type === "e2e_notification" || !message.body || typeof message.body !== "string") {
    //   return;
    // }

    // Abaikan notifikasi E2E
    if (message.type === "e2e_notification") {
      return;
    }

    // Abaikan pesan tanpa body (misalnya notifikasi awal dari WhatsApp)
    if (!message.body || typeof message.body !== "string") {
      return;
    }

    // Hanya jika bukan chat dan ada body, baru kasih unsupported
    if (message.type !== "chat") {
      await sendWhatsAppMessage(client, message.from, UNSUPPORTED_TYPE_MESSAGE);
      return;
    }

    const userPhoneNumber = message.from;
    const botPhoneNumber = message.to;
    const messageTimestamp = message.timestamp;
    console.log(`[MSG] from: ${userPhoneNumber}, body: ${message.body}`);

    let responseText = "";

    // Handle First Message
    if (messageTimestamp > serverOnlineTime && !SESSION_STATUS[userPhoneNumber]) {
      SESSION_STATUS[userPhoneNumber] = { client: client, lastActive: Date.now(), optionSession: "0", businessPhoneNumberId: botPhoneNumber };
      await sendWhatsAppMessage(client, userPhoneNumber, MENU_STRUCTURE["0"].message);
      return;
    }

    // Check if message is valid and the user is in session
    if (messageTimestamp > serverOnlineTime && SESSION_STATUS[userPhoneNumber]) {
      const userMessage = message.body.trim().toLowerCase();
      const isValidOption = VALID_OPTIONS.includes(userMessage);
      const { optionSession } = SESSION_STATUS[userPhoneNumber];
      SESSION_STATUS[userPhoneNumber].lastActive = Date.now();
      const currentMenu = MENU_STRUCTURE[SESSION_STATUS[userPhoneNumber].optionSession];

      // back to main menu
      if (userMessage === "0") {
        SESSION_STATUS[userPhoneNumber] = {
          ...SESSION_STATUS[userPhoneNumber], // jaga properti lain
          client, // 🔑 simpan client
          lastActive: Date.now(),
          optionSession: "0",
          businessPhoneNumberId: botPhoneNumber,
        };
        responseText = MENU_STRUCTURE["0"].message;

        // main code when in session
      } else if (optionSession && optionSession != "0") {
        if (currentMenu) {
          if (currentMenu == MENU_STRUCTURE["2"]) {
            SESSION_STATUS[userPhoneNumber] = {
              ...SESSION_STATUS[userPhoneNumber],
              client,
              lastActive: Date.now(),
            };
            return;
          }
          if (currentMenu.options?.[`${SESSION_STATUS[userPhoneNumber]?.optionSession}.${userMessage}`]) {
            if (userMessage === "99") {
              SESSION_STATUS[userPhoneNumber].optionSession = SESSION_STATUS[userPhoneNumber].optionSession.split(".").slice(0, -1).join(".") || "0";
            } else {
              SESSION_STATUS[userPhoneNumber].optionSession = `${SESSION_STATUS[userPhoneNumber].optionSession}.${userMessage}`;
            }
            const newMenu = MENU_STRUCTURE[SESSION_STATUS[userPhoneNumber].optionSession];
            if (newMenu == MENU_STRUCTURE["2"]) {
              const now = new Date();
              const utcHour = now.getUTCHours();
              const utcMinute = now.getUTCMinutes();
              const gmtOffset = 8; // GMT+8
              const currentHour = (utcHour + gmtOffset) % 24;
              const currentMinute = utcMinute;
              const currentDay = now.getUTCDay(); // Minggu=0, Senin=1, ..., Jumat=5, Sabtu=6

              console.log("Current Hour (GMT+8):", currentHour);
              console.log("Current Minute (GMT+8):", currentMinute);
              console.log("Current Day:", currentDay);

              let isWorkHour = false;

              if (currentDay >= 1 && currentDay <= 4) {
                // Senin–Kamis: 08.00–15.30
                isWorkHour = (currentHour > 8 && currentHour < 15) || (currentHour === 8 && currentMinute >= 0) || (currentHour === 15 && currentMinute <= 30);
              } else if (currentDay === 5) {
                // Jumat: 08.00–16.00
                isWorkHour = (currentHour > 8 && currentHour < 16) || (currentHour === 8 && currentMinute >= 0) || (currentHour === 16 && currentMinute == 0);
              }

              if (isWorkHour) {
                console.log("It's within working hours.");
                SESSION_STATUS[userPhoneNumber] = {
                  ...SESSION_STATUS[userPhoneNumber],
                  client,
                  lastActive: Date.now(),
                };
              } else {
                console.log("It's outside working hours.");
                await sendWhatsAppMessage(client, userPhoneNumber, NOT_IN_WORKING_HOURS);
                SESSION_STATUS[userPhoneNumber] = {
                  ...SESSION_STATUS[userPhoneNumber],
                  client,
                  lastActive: Date.now(),
                };
                return;
              }
            }

            // Check if newMenu's message is the same as HOME_MESSAGE + FOOTER
            responseText = newMenu ? (newMenu.message == HOME_MESSAGE + FOOTER ? newMenu.message : newMenu.message + BACK_TO_MENU) : WRONG_COMMAND + MENU_STRUCTURE[SESSION_STATUS[userPhoneNumber].optionSession].message + BACK_TO_MENU;
          } else {
            responseText = WRONG_COMMAND + MENU_STRUCTURE[SESSION_STATUS[userPhoneNumber].optionSession].message + BACK_TO_MENU;
          }
        }

        // first valid message
      } else if (isValidOption) {
        SESSION_STATUS[userPhoneNumber].optionSession = userMessage;

        if (userMessage === "2") {
          // === Konsultasi Statistik ===
          responseText = MENU_STRUCTURE["2"].message + BACK_TO_MENU;
          await sendWhatsAppMessage(client, userPhoneNumber, responseText);

          SESSION_STATUS[userPhoneNumber] = {
            ...SESSION_STATUS[userPhoneNumber],
            client,
            lastActive: Date.now(),
            optionSession: "2",
          };
          return;
        } else {
          // Opsi valid lainnya
          responseText = MENU_STRUCTURE[SESSION_STATUS[userPhoneNumber].optionSession].message + BACK_TO_MENU;
        }
      } else {
        responseText = WRONG_COMMAND + HOME_MESSAGE + FOOTER;
        SESSION_STATUS[userPhoneNumber] = {
          ...SESSION_STATUS[userPhoneNumber],
          client,
          lastActive: Date.now(),
          optionSession: "0",
        };
      }

      // Kirim balasan
      await sendWhatsAppMessage(client, userPhoneNumber, responseText);
      SESSION_STATUS[userPhoneNumber] = {
        ...SESSION_STATUS[userPhoneNumber],
        client,
        lastActive: Date.now(),
      };
    }
  });
}

// send func
async function sendWhatsAppMessage(client, to, message) {
  try {
    await markMessageAsSeen(client, to);
    await client.startTyping(to);
    await client.sendText(to, message);
    await client.stopTyping(to);
  } catch (error) {
    console.error(`Failed to send message to ${to}:`, error.message);
  }
}

// blue mark func
async function markMessageAsSeen(client, messageId) {
  try {
    await client.sendSeen(messageId);
  } catch (error) {
    console.error(`Failed to mark message ${messageId} as seen:`, error.message);
  }
}
