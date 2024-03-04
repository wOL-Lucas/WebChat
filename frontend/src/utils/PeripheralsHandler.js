
const GrantMicPermission = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      resolve(stream);
    } catch (error) {
      reject(error);
    }
  });
}

const GrantCamPermission = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      resolve(stream);
    } catch (error) {
      reject(error);
    }
  });
}

const FinishDeviceUsage = (stream) => {
  return new Promise( async (resolve, reject) => {
    try {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}


export {GrantMicPermission, GrantCamPermission, FinishDeviceUsage};

