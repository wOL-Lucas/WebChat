

const blobParser = (blob) => {
   return new Promise((resolve, reject) => {
       const reader = new FileReader();
       reader.readAsDataURL(blob);
       reader.onloadend = () => {
           let base64data = reader.result;
           resolve(base64data);
       }
   })
}


export {blobParser};
