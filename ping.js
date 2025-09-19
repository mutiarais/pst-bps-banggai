// ping.js
import https from 'https';

const url = 'https://meta-wa-bot-node.onrender.com';

export const pingServer = () => {
  https.get(url, (res) => {
    console.log(`Server responded with status code: ${res.statusCode}`);
    res.on('data', (d) => {
      // Optional: Handle response data if needed
      return
    });
  }).on('error', (e) => {
    console.error(`Error: ${e.message}`);
    return
  });
};

