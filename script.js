const video = document.getElementById("video");
const captureBtn = document.getElementById("capture-btn");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const thumbnails = document.getElementById("thumbnails");

const constraints = {
  video: {
    width: { ideal: 640 },
    height: { ideal: 480 },
  }
};

let imgCounter = 0;

async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    video.play();
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

  mergedCanvas.width = 480;
  let totalHeight = 0;
  const spacing = 10; // Add spacing between images

  const imagePromises = [];

  for (let i = 0; i < 4; i++) {
    const wrapper = document.getElementById(`wrapper${i}`);
    if (wrapper) {
      const img = wrapper.querySelector("img");

      const loadImagePromise = new Promise((resolve) => {
        const tempImg = new Image();
        tempImg.crossOrigin = "anonymous";
        tempImg.src = img.src;
        tempImg.onload = () => {
          const scaleFactor = 480 / tempImg.width;
          const imgCanvas = document.createElement("canvas");
          const imgCtx = imgCanvas.getContext("2d");

          imgCanvas.width = 480;
          imgCanvas.height = tempImg.height * scaleFactor;
          imgCtx.drawImage(tempImg, 0, 0, imgCanvas.width, imgCanvas.height);

          totalHeight += imgCanvas.height + spacing;
          resolve(imgCanvas);
        };
      });

      imagePromises.push(loadImagePromise);
    }
  }

  const loadedImages = await Promise.all(imagePromises);

  mergedCanvas.height = totalHeight - spacing; // Subtract the last spacing

  let yOffset = 0;
  loadedImages.forEach((imgCanvas) => {
    ctx.drawImage(imgCanvas, 0, yOffset, imgCanvas.width, imgCanvas.height);
    yOffset += imgCanvas.height + spacing;
  });

  const mergedImage = mergedCanvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = mergedImage;
  link.download = "merged_image.png";
  link.click();
});


initCamera();
