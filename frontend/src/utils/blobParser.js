

const blobToBase64 = (blob) => {
   return new Promise((resolve, reject) => {
       const reader = new FileReader();
       reader.readAsDataURL(blob);
       reader.onloadend = () => {
           let base64data = reader.result;
           resolve(base64data);
       }
   })
}


const base64toBlob = (base64Data) => {
    base64Data = base64Data.replace("data:audio/wav;base64,", "");
    let byteCharacters = atob(base64Data);
    let byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    let byteArray = new Uint8Array(byteNumbers);
    let blob = new Blob([byteArray], {type: "audio/wav"});
    return blob;
}
export {blobToBase64, base64toBlob};

