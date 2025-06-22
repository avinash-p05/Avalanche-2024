// src/utils/encryption.js
import CryptoJS from "crypto-js";

const ENCRYPTION_KEY =
  import.meta.env.VITE_ENCRYPTION_KEY || "default_encryption_key"; // Use environment variable or default key
export const encryptData = (data) => {
  try {
    return CryptoJS.AES.encrypt(
      JSON.stringify(data),
      ENCRYPTION_KEY
    ).toString();
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
};

export const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};
