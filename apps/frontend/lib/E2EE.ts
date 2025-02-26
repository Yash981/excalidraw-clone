"use client"
export const generateKey = async (): Promise<CryptoKey> => {
  return await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 128 },
    true,
    ["encrypt", "decrypt"]
  );
};
export async function encryptMessage(
  key: CryptoKey,
  message: string
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    data
  );

  return new Blob([iv, encryptedData]).arrayBuffer();
}

export async function decryptMessage(
  key: CryptoKey,
  encryptedData: ArrayBuffer
): Promise<string> {
  const iv = new Uint8Array(encryptedData.slice(0, 12));
  const data = new Uint8Array(encryptedData.slice(12));

  try {
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      data
    );

    return new TextDecoder().decode(decryptedData);
  } catch (error:any) {
    throw new Error('Decryption failed. Please check the key and data.',error);
  }
}
export const uploadContentToserver = async (
  encryptedData: ArrayBuffer
): Promise<string> => {
  const response = await fetch("http://localhost:9000/api/v1/upload", { method: "POST", body: encryptedData,headers:{ "Content-Type": "application/octet-stream" },credentials:"include" })
  
  const {url} = await response.json();
  return url
};
export const generateShareableURL = async (
  key: CryptoKey,
  encryptedData: ArrayBuffer
): Promise<string> => {
  const objectUrl = await uploadContentToserver(encryptedData);
  const exportedKey = await window.crypto.subtle.exportKey("jwk", key);
  const objectKey = encodeURIComponent(exportedKey.k!);
  const url = objectUrl + "#key=" + objectKey;
  return url;
};
export const downloadEncryptedContent = async (id: string): Promise<ArrayBuffer> => {
  const response = await fetch(`http://localhost:9000/api/v1/download?id=${id}`,{credentials:"include"});
  const res = await response.arrayBuffer()
  return res
};
export async function ExtractKeyFromURL():Promise<CryptoKey | null> {
    const hashedValue = window.location.hash
    if(!hashedValue.includes("#key=")) return null;

    const objectKey = decodeURIComponent(hashedValue.slice("#key=".length));

    return await window.crypto.subtle.importKey("jwk",{
        k:objectKey,
        alg:"A128GCM",
        ext:true,
        key_ops:["encrypt","decrypt"],
        kty:"oct"
    },{
        name:"AES-GCM",length:128
    },false,["decrypt"])
    
}

export const uploadEncryptedDataToServer = async (data:string) =>{
  const key = await generateKey();
  const encryptedData = await encryptMessage(key,data)
  const shareableURL = await generateShareableURL(key,encryptedData);
  const newUrl = new URL(shareableURL)
  return `${newUrl.origin}${newUrl.pathname}/${newUrl.search.slice(4)}${newUrl.hash}`

}
export const downloadEncryptedDataOnClient = async (url:string) =>{
  const urlObj = new URL(url)
  const extractedKey = await ExtractKeyFromURL();
  if(!extractedKey){
    console.error('Invalid or missing key in URL!');
    return;
  }
  const downloadData = await downloadEncryptedContent(urlObj.pathname.split('/')[2])
  const decryptedMessage = await decryptMessage(extractedKey,downloadData);
  return decryptedMessage
}
export const TosendEncyptedDataViaWebsocket = async (data:string) =>{
  console.log('it came here')
  const key = await generateKey();
  const encryptedData = await encryptMessage(key,data)
  return encryptedData
}
export const ToDecryptEncryptedDataViaWebsocket = async (encryptedData:ArrayBuffer) =>{
  const extractedKey = await ExtractKeyFromURL();
  if(!extractedKey){
    console.error('Invalid or missing key in URL!');
    return;
  }
  const decryptedMessage = await decryptMessage(extractedKey,encryptedData);
  return decryptedMessage
}
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}