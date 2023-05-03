const video = document.getElementById("video");
const captureBtn = document.getElementById("capture-btn");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const thumbnails = document.getElementById("thumbnails");

const constraints = {
  video: {
    width: { ideal: 480 },
    height: { ideal: 640 },

  }
};

let imgCounter = 0;

async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
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

initCamera();
