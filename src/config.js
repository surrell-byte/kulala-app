export const KULALA_CONFIG = {
  appName: 'Kulala',
  tagline: 'Bedtime Stories with African Magic',
  version: '2.0.0',
};

export function generateFallbackCover(title = '', category = 'Calm') {
  const canvas = document.createElement('canvas');
  canvas.width = 400; canvas.height = 500;
  const ctx = canvas.getContext('2d');
  const palettes = {
    Calm:      ['#1a1a3e', '#2d1b4e'],
    Adventure: ['#2a1500', '#5a2800'],
    Sleep:     ['#050510', '#0f1528'],
    Default:   ['#0d0b1a', '#1a1830'],
  };
  const [c1, c2] = palettes[category] || palettes.Default;
  const grad = ctx.createLinearGradient(0, 0, 0, 500);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 400, 500);

  ctx.beginPath();
  ctx.arc(200, 190, 100, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(232,168,62,0.07)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(232,168,62,0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = '64px serif';
  ctx.textAlign = 'center';
  ctx.fillText('🌙', 200, 215);

  ctx.fillStyle = '#f2ead8';
  ctx.font = '600 18px "DM Sans", sans-serif';
  const words = title.split(' ');
  let line = '', y = 350;
  words.forEach(w => {
    if ((line + w).length > 18) {
      ctx.fillText(line.trim(), 200, y);
      line = w + ' ';
      y += 28;
    } else {
      line += w + ' ';
    }
  });
  ctx.fillText(line.trim(), 200, y);
  return canvas.toDataURL();
}
