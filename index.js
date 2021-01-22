"use strict";

const filters = [
  {
    match: { origin: "https://detail.tmall.com", pathname: "/item.htm" },
    action: { fpChannel: 9 }
  }
];

const qrcode = require("qrcode-generator");
const errorCorrectionLevel = "L";
let url = location.href;
let urlObj = new URL(url);

for (let filter of filters) {
  if (
    Object.keys(filter.match).every((key) => {
      return typeof filter.match[key] == "object"
        ? filter.match[key].test(urlObj[key]) // assume RegExp
        : urlObj[key] == filter.match[key];
    })
  ) {
    if (typeof filter.action == "object") {
      Object.keys(filter.action).forEach((key) => {
        urlObj.searchParams.set(key, filter.action[key]);
      });
    } else if (typeof filter.action == "function") {
      urlObj = filter.action(urlObj);
    }
    break;
  }
}
url = urlObj.href;

function generateImg(data) {
  let qr;
  let typeNumber = 1;

  while (typeNumber <= 40) {
    qr = qrcode(typeNumber, errorCorrectionLevel);
    qr.addData(data);

    try {
      qr.make();
      return qr.createImgTag(8, 8 * 4).match(/src="(.*?)"/)[1];
    } catch (err) {
      typeNumber += 1;
    }
  }
}

const wrapper = document.createElement("div");
wrapper.style.position = "fixed";
wrapper.style.zIndex = 2147483647;
wrapper.style.top = 0;
wrapper.style.left = 0;
wrapper.style.width = "100%";
wrapper.style.height = "100%";
wrapper.style.backgroundColor = "rgba(255,255,255, 0.5)";
wrapper.style.cursor = "pointer";
wrapper.addEventListener(
  "click",
  (event) => {
    if (event.target === event.currentTarget) {
      wrapper.parentNode.removeChild(wrapper);
    }
  },
  false
);

const qrBox = document.createElement("div");
qrBox.style.position = "absolute";
qrBox.style.top = "50%";
qrBox.style.left = "50%";
qrBox.style.maxWidth = "400px";
qrBox.style.transform = "translate(-50%, -50%)";
qrBox.style.cursor = "auto";
wrapper.appendChild(qrBox);

const qrImg = document.createElement("img");
qrImg.src = generateImg(url);
qrImg.style.display = "block";
qrImg.style.width = "100%";
qrBox.appendChild(qrImg);

const input = document.createElement("textarea");
input.value = url;
input.rows = 3;
input.style.width = "100%";
input.style.fontSize = "14px";
input.style.boxSizing = "border-box";
input.style.wordBreak = "break-all";
input.addEventListener(
  "input",
  (event) => {
    qrImg.src = generateImg(input.value);
  },
  false
);
qrBox.appendChild(input);

document.body.appendChild(wrapper);
