// ==========================================================================
// Aachico Vault - Customer Digital Signature Canvas Module
// ==========================================================================

/**
 * डिजिटल सिग्नेचर पैड इनिशियलाइज करना (HTML5 Canvas पर दस्तखत के लिए)
 */
export function initSignaturePad(canvasElementId) {
  const canvas = document.getElementById(canvasElementId);
  if (!canvas) return null;

  const ctx = canvas.getContext('2d');
  let isDrawing = false;

  // Canvas dimensions fix
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  function startPosition(e) {
    isDrawing = true;
    draw(e);
  }

  function endPosition() {
    isDrawing = false;
    ctx.beginPath();
  }

  function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
    const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  // Mouse Events
  canvas.addEventListener('mousedown', startPosition);
  canvas.addEventListener('mouseup', endPosition);
  canvas.addEventListener('mousemove', draw);

  // Touch Events for Mobile / Tablets
  canvas.addEventListener('touchstart', startPosition);
  canvas.addEventListener('touchend', endPosition);
  canvas.addEventListener('touchmove', draw);

  return {
    clear: () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
    toDataURL: () => {
      return canvas.toDataURL('image/png');
    },
    isEmpty: () => {
      const pixelBuffer = new Uint32Array(
        ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer
      );
      return !pixelBuffer.some(color => color !== 0);
    }
  };
}
