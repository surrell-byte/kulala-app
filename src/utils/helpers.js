export function generateFallbackCover(title, category = "Calm") {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 500;
  const ctx = canvas.getContext('2d');
  const gradients = {
    Sleep: ["#0f2027", "#203a43", "#2c5364"],
    Calm: ["#1e3c72", "#2a5298"],
    Adventure: ["#42275a", "#734b6d"],
    Magic: ["#141E30", "#243B55"],
    Animals: ["#134E5E", "#71B280"]
  };
  const colors = gradients[category] || gradients.Calm;
  const grad = ctx.createLinearGradient(0, 0, 400, 500);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(1, colors[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 400, 500);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px Quicksand";
  ctx.textAlign = "center";
  const words = title.split(" ");
  let line = "";
  let y = 200;
  words.forEach(word => {
    const testLine = line + word + " ";
    if (testLine.length > 18) {
      ctx.fillText(line, 200, y);
      line = word + " ";
      y += 30;
    } else {
      line = testLine;
    }
  });
  ctx.fillText(line, 200, y);
  return canvas.toDataURL();
}

export function showStreakMessage(streak) {
  const div = document.createElement('div');
  div.innerText = `🔥 ${streak} Day Streak! Keep going!`;
  div.className = "streak-toast";
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 2000);
}