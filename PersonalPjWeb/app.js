function magnify(imgID, zoom) {
  const img = document.getElementById(imgID);

  // 建立放大鏡元素
  const glass = document.createElement("DIV");
  glass.setAttribute("class", "img-magnifier-glass");
  img.parentElement.insertBefore(glass, img);

  // 設定背景
  glass.style.backgroundImage = `url('${img.src}')`;
  glass.style.backgroundRepeat = "no-repeat";
  glass.style.backgroundSize =
    `${img.naturalWidth * zoom}px ${img.naturalHeight * zoom}px`;

  const bw = 3;
  const w = glass.offsetWidth / 2;
  const h = glass.offsetHeight / 2;

  // 監聽滑鼠移動
  img.addEventListener("mousemove", moveMagnifier);
  glass.addEventListener("mousemove", moveMagnifier);

  function moveMagnifier(e) {
    e.preventDefault();
    const pos = getCursorPos(e);
    let x = pos.x;
    let y = pos.y;

    // 邊界限制
    if (x > img.offsetWidth - (w / zoom)) x = img.offsetWidth - (w / zoom);
    if (x < w / zoom) x = w / zoom;
    if (y > img.offsetHeight - (h / zoom)) y = img.offsetHeight - (h / zoom);
    if (y < h / zoom) y = h / zoom;

    // 放大鏡位置
    glass.style.left = `${x - w}px`;
    glass.style.top = `${y - h}px`;

    // 背景位置依比例換算
    const ratioX = img.naturalWidth / img.offsetWidth;
    const ratioY = img.naturalHeight / img.offsetHeight;

    glass.style.backgroundPosition =
      `-${(x * zoom * ratioX) - w + bw}px -${(y * zoom * ratioY) - h + bw}px`;
  }

  function getCursorPos(e) {
    const a = img.getBoundingClientRect();
    const x = e.clientX - a.left;
    const y = e.clientY - a.top;
    return { x, y };
  }

  // 🔹 當視窗大小改變或重新顯示時，重新設定背景大小
  window.addEventListener("resize", () => {
    glass.style.backgroundSize =
      `${img.naturalWidth * zoom}px ${img.naturalHeight * zoom}px`;
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      glass.style.backgroundSize =
        `${img.naturalWidth * zoom}px ${img.naturalHeight * zoom}px`;
    }
  });
}

// 啟用放大鏡，zoom 倍率可調整
magnify("test", 2);
