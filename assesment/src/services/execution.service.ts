import axios from 'axios';

const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com/submissions";
const RAPID_API_KEY = "ab5aad1fbamsh2ae090f975516b9p1cb737jsn5eb1bd9f7f84"; // RapidAPI -> Judge0 API Key

export const executeCode = async (sourceCode: string, languageId: number) => {
  const options = {
    method: 'POST',
    url: JUDGE0_URL,
    params: { base64_encoded: 'true', fields: '*' },
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': RAPID_API_KEY,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
    },
    data: {
      source_code: btoa(sourceCode), // تحويل الكود إلى Base64
      language_id: languageId, // مثال: 63 لـ JavaScript، 71 لـ Python
    }
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error("Execution Error:", error);
    throw error;
  }
};