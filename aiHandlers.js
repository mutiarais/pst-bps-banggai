// gemini.js
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
// import fs from 'fs';
// import natural from 'natural';
import { BACK_TO_MENU, DISCLAIMER_AI } from "./const.js";

import axios from "axios";

// // Function to filter out short words and handle punctuation
// function filterShortWords(str, minLength) {
//   return str
//     .split(/\s+/)  // Split by any whitespace
//     .map(word => word.replace(/[.,!?;()]/g, ''))  // Remove punctuation
//     .filter(word => word.length > minLength)
//     .join(' ');
// }

// // Function to find sentences with keyword using TF-IDF
// function findSentencesWithKeyword(text, phrase) {
//   const filteredPhrase = filterShortWords(phrase, 1);

//   if (!filteredPhrase) return [];

//   const tokenizer = new natural.SentenceTokenizer();
//   const sentences = tokenizer.tokenize(text);
//   const tfidf = new natural.TfIdf();

//   // Filter out short words from each sentence before adding to TfIdf instance
//   sentences.forEach(sentence => {
//     const filteredSentence = filterShortWords(sentence, 2);
//     console.log("===============");
//     console.log(filteredSentence);
//     console.log("===============");

//     tfidf.addDocument(filteredSentence);
//   });

//   const results = [];
//   let contextSentences = [];

//   // Calculate the TF-IDF measure for each sentence
//   tfidf.tfidfs(filteredPhrase, (i, measure) => {
//     if (measure > 0) {
//       contextSentences.push(...sentences.slice(Math.max(0, i - 1), Math.min(sentences.length, i + 2)));

//       // Remove duplicate sentences while maintaining order
//       contextSentences = [...new Set(contextSentences)];

//       results.push({
//         index: i,
//         context: contextSentences.join(' ')
//       });

//       // Reset context for next phrase
//       contextSentences = [];
//     }
//   });

//   // Optional: Deduplicate results if necessary
//   const uniqueResults = Array.from(new Set(results.map(res => res.context)))
//     .map(context => results.find(res => res.context === context));

//   return uniqueResults.map(result => result.context);
// }

// // Process each document and generate the result
// function processDocuments(data, userPrompt) {
//   return data.map(doc => {
//     const { sumber, extractedtext } = doc;
//     const sentences = findSentencesWithKeyword(extractedtext, userPrompt);
//     return `sumber = ${sumber}\npassage = ${sentences.join('\n')}\n`;
//   }).join('');
// }

// // Load JSON data from file
// const data = JSON.parse(fs.readFileSync('./parsed_data_v1.json', 'utf8'));


// // Function to handle Gemini response
// export async function handleGeminiResponse(userPrompt) {
//   const { GEMINI_API_KEY } = process.env;
//   if (!GEMINI_API_KEY) {
//     console.error("GEMINI_API_KEY is not set.");
//     return "Configuration error: GEMINI_API_KEY is not set.";
//   }

//   const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

//   // Manually create a fetch function for the generative model
//   const model = genAI.getGenerativeModel({
//     model: "gemini-1.5-flash",
//     safetySettings: [
//       {
//         category: HarmCategory.HARM_CATEGORY_HARASSMENT,
//         threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
//       },
//     ],
//   });


//   const passage = processDocuments(data, userPrompt);

//   // Create a prompt
//   const prompt = `Anda adalah seorang perwakilan yang berpengetahuan dan membantu dari Badan Pusat Statistik (BPS)
//   Kabupaten kudus yang memberikan data dan informasi kepada pengguna terutama terkait statistik khususnya statistik 
//   kudus. Tujuan Anda adalah untuk menjawab pertanyaan menggunakan data yang kamu miliki di bawah ini. INGAT! Data di bawah merupakan data yang kamu miliki bukan data yang saya berikan ke kamu. 
//   Pastikan jawaban Anda komprehensif, mudah dipahami, dan menghindari jargon teknis sebisa mungkin. 
//   Gunakan nada yang ramah dan pecahkan konsep-konsep yang kompleks menjadi informasi yang 
//   sederhana dan mudah dicerna. Gunakan referensi data yang kamu miliki sebagai alat bantu selain pengetahuanmu sendiri!. 
//   Jika data yang kamu miliki di bawah tidak mengandung informasi yang relevan untuk jawaban, Anda boleh mengabaikannya dan menjawab sesuai pengetahuanmu. 
//   Sebisa mungkin format jawaban sebagai berikut 1. salam pembuka singkat 2. sumber data (asal datanya, judulnya saja!) jika merupakan 
//   angka/metode/hasil analisis atau yang terkait dengan hasil statistik, jika bukan maka cukup jawab langsung saja. Jangan bilang bahwa data tambahan ini dari saya, ini adalah data kamu!.
//   Berikut pertanyaan dan referensi bantuan yang mungkin dibutuhkan.\n\nPERTANYAAN: '${userPrompt}'\n\nDATA TAMBAHAN: '${passage}'\n\nJAWABAN:`;

//   let geminiResponse = "";

//   try {
//     const result = await model.generateContent(prompt);
//     geminiResponse = result.response.text();
//     return `${geminiResponse} ${DISCLAIMER_AI}`;
//   } catch (error) {
//     console.error("Error generating Gemini response:", error);
//     return "Maaf, terjadi kesalahan saat memproses permintaan Anda.";
//   }
// }


export async function handleGeminiResponse(userMessage) {
  const { GEMINI_API_KEY } = process.env;
  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set.");
    return "Configuration error: GEMINI_API_KEY is not set.";
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  // Manually create a fetch function for the generative model
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_HIGH,
      }
    ],
  });
  
  try {
    // change based on python url either local or public url
    const response = await axios.post('your-py-url/get_prompt', {
      query: userMessage
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Ambil data dari response
    const data = response.data;
    console.log("Response Data:", data);

    // Kembalikan jawaban
    let geminiResponse = "";

    try {
      const result = await model.generateContent(data.prompt);
      geminiResponse = result.response.text();
      return `${geminiResponse}${DISCLAIMER_AI}`;
    } catch (error) {
      console.error("Error generating Gemini response:",error.response);
      return "Maaf, Saat Ini AI Belum Tersedia.";
    }
  } catch (error) {
    console.error("Error fetching answer:", error.response);
    return "Maaf, Saat Ini AI Sedang Tidak Tersedia.";
  }
}