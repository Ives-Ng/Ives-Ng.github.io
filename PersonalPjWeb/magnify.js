

function magnifyAll(selector, zoom) {
  const images = document.querySelectorAll(selector);

  images.forEach(img => {
    createMagnifier(img, zoom);
  });
}

function createMagnifier(img, zoom) {
  const glass = document.createElement("div");
  glass.className = "img-magnifier-glass";
  img.parentElement.appendChild(glass);

  glass.style.backgroundImage = `url('${img.src}')`;
  glass.style.backgroundSize =
    `${img.naturalWidth * zoom}px ${img.naturalHeight * zoom}px`;

  function move(e) {
    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ratioX = img.naturalWidth / img.offsetWidth;
    const ratioY = img.naturalHeight / img.offsetHeight;

    glass.style.left = `${x}px`;
    glass.style.top = `${y}px`;

    glass.style.backgroundPosition =
      `-${x * ratioX * zoom - glass.offsetWidth / 2}px
       -${y * ratioY * zoom - glass.offsetHeight / 2}px`;
  }

  img.addEventListener("mousemove", move);
  img.addEventListener("mouseenter", () => glass.style.display = "block");
  img.addEventListener("mouseleave", () => glass.style.display = "none");
}

magnifyAll(".touristImg", 1.8);
