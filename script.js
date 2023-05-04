const video = document.getElementById("video");
const captureBtn = document.getElementById("capture-btn");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const thumbnails = document.getElementById("thumbnails");

const constraints = {
  video: {
    width: { ideal: 640 }, // Adjust the ideal width
    height: { ideal: 480 }, // Adjust the ideal height
  }
};

let imgCounter = 0;

async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    video.play(); // Add this line to start the video automatically
  } catch (err) {
    console.error("Error accessing the camera", err);
  }
}


function captureImage() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

  const img = new Image();
  img.src = canvas.toDataURL("image/png");

  if (imgCounter >= 4) {
    imgCounter = 0;
  }
  let existingWrapper = thumbnails.querySelector(`#wrapper${imgCounter}`);
  if (existingWrapper) {
    let existingImg = existingWrapper.querySelector("img");
    existingImg.src = img.src;
  } else {
    img.id = `thumb${imgCounter}`;

    const wrapper = document.createElement("div");
    wrapper.id = `wrapper${imgCounter}`;
    wrapper.className = "thumbnail-wrapper";
    wrapper.appendChild(img);

    thumbnails.appendChild(wrapper);
  }
  imgCounter++;
}

captureBtn.addEventListener("click", captureImage);


const downloadBtn = document.getElementById("download");

downloadBtn.addEventListener("click", async () => {
  const mergedCanvas = document.createElement("canvas");
  const ctx = mergedCanvas.getContext("2d");

  mergedCanvas.width = 240;
  mergedCanvas.height = 1280;

  let yOffset = 0;

  for (let i = 0; i < 4; i++) {
    const wrapper = document.getElementById(`wrapper${i}`);
    if (wrapper) {
      const img = wrapper.querySelector("img");

      await new Promise((resolve) => {
        const tempImg = new Image();
        tempImg.src = img.src;
        tempImg.onload = () => {
          const imgCanvas = document.createElement("canvas");
          const imgCtx = imgCanvas.getContext("2d");

          imgCanvas.width = tempImg.width;
          imgCanvas.height = tempImg.height;
          imgCtx.drawImage(tempImg, 0, 0, tempImg.width, tempImg.height);

          ctx.drawImage(imgCanvas, 0, yOffset, 240, 320);
          yOffset += 320;
          resolve();
        };
      });
    }
  }

  const mergedImage = mergedCanvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = mergedImage;
  link.download = "merged_image.png";
  link.click();
});



initCamera();