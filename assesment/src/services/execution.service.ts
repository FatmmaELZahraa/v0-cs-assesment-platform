// src/services/execution.service.ts
import axios from 'axios';

const RAPID_API_KEY = 'ab5aad1fbamsh2ae090f975516b9p1cb737jsn5eb1bd9f7f84';
const RAPID_API_HOST = 'judge029.p.rapidapi.com';
const BASE_URL = 'https://judge029.p.rapidapi.com/submissions';
const safeBtoa = (str: string) => {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (e) {
    return btoa(str);
  }
};

export const executeCode = async (sourceCode: string, languageId: number, stdin: string = "") => {
  const postOptions = {
    method: 'POST',
    url: 'https://judge029.p.rapidapi.com/submissions',
    params: { base64_encoded: 'true', fields: '*' },
    headers: {
      'content-type': 'application/json',
      'x-rapidapi-key': 'cb3a33c8ebmshcee9b05ec4a9649p1958c3jsn88af6961de32',
      'x-rapidapi-host': 'judge029.p.rapidapi.com'
    },
    data: {
      source_code: safeBtoa(sourceCode), 
      language_id: languageId,
      stdin: safeBtoa(stdin)
    }
  };

  const postResponse = await axios.request(postOptions);
  const token = postResponse.data.token;

  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const getOptions = {
    method: 'GET',
    url: `https://judge029.p.rapidapi.com/submissions/${token}`,
    params: { base64_encoded: 'true', fields: '*' },
    headers: {
      'x-rapidapi-key': 'cb3a33c8ebmshcee9b05ec4a9649p1958c3jsn88af6961de32',
      'x-rapidapi-host': 'judge029.p.rapidapi.com'
    }
  };

  const getResponse = await axios.request(getOptions);
  return getResponse.data;
};