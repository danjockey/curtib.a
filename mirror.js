/* Curtib.a — desenha a prévia do espelho num <canvas> (para imagem e PDF). */
(function () {
  var C = { ink: "#111712", muted: "#6B736D", green: "#1E4D33", coral: "#FF4B3A", luz: "#FFD07A", line: "#E6E8E4" };
  var ICON = {
    heart: "M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z",
    cmt: "M20.5 12a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.1-4.2A8.5 8.5 0 1 1 20.5 12z",
    rep: "M4 9.5V8a3 3 0 0 1 3-3h12l-3-3M20 14.5V16a3 3 0 0 1-3 3H5l3 3",
    send: "M21.5 2.5 10.5 13.5M21.5 2.5l-7 19-4-8-8-4z",
    save: "M18.5 21 12 15.5 5.5 21V4a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1z",
    home: "M3.5 10.5 12 3.5l8.5 7V20a.5.5 0 0 1-.5.5h-5v-6h-6v6H4a.5.5 0 0 1-.5-.5z",
    play: "M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3zM3 8.5h18M8.5 3l3 5.5M14 3l3 5.5M10 12v5l4.5-2.5z",
    search: "M18.5 11a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0zM21 21l-4.5-4.5"
  };
  var MARK = ["M17 20 Q24 27 31 20", "M13 29 Q24 39 35 29", "M10 38 Q24 50 38 38", "M24 44 V50"];

  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); }
  function icon(ctx, name, x, y, size, opt) {
    opt = opt || {};
    ctx.save(); ctx.translate(x, y); ctx.scale(size / 24, size / 24);
    var p = new Path2D(ICON[name]);
    if (opt.fill) { ctx.fillStyle = opt.fill; ctx.fill(p); }
    else { ctx.strokeStyle = opt.color || C.ink; ctx.lineWidth = 1.8; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke(p); }
    ctx.restore();
  }
  function mark(ctx, cx, cy, h, color) {
    var s = h / 72;
    ctx.save(); ctx.translate(cx - 24 * s, cy - 36 * s); ctx.scale(s, s);
    ctx.strokeStyle = color; ctx.lineWidth = 5.5; ctx.lineCap = "round"; ctx.lineJoin = "round";
    rr(ctx, 3, 3, 42, 66, 14); ctx.stroke();
    MARK.forEach(function (d) { ctx.stroke(new Path2D(d)); });
    ctx.beginPath(); ctx.arc(24, 59, 4, 0, Math.PI * 2); ctx.fillStyle = "#FF5B4A"; ctx.fill();
    ctx.restore();
  }
  function avatar(ctx, cx, cy, r, logo) {
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.closePath();
    if (logo) {
      ctx.clip(); ctx.fillStyle = "#fff"; ctx.fill();
      var s = Math.max((2 * r) / logo.width, (2 * r) / logo.height);
      ctx.drawImage(logo, cx - logo.width * s / 2, cy - logo.height * s / 2, logo.width * s, logo.height * s);
    } else { ctx.fillStyle = C.green; ctx.fill(); mark(ctx, cx, cy, r * 1.15, "#fff"); }
    ctx.restore();
  }
  function badge(ctx, x, cy, d) {
    ctx.beginPath(); ctx.arc(x + d / 2, cy, d / 2, 0, Math.PI * 2); ctx.fillStyle = C.green; ctx.fill();
    ctx.save(); ctx.translate(x, cy - d / 2); ctx.scale(d / 16, d / 16);
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.8; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.stroke(new Path2D("m4.6 8.2 2.3 2.2 4.5-4.6")); ctx.restore();
  }
  function fit(ctx, text, maxW) {
    if (ctx.measureText(text).width <= maxW) return text;
    while (text.length > 1 && ctx.measureText(text + "…").width > maxW) text = text.slice(0, -1);
    return text + "…";
  }
  function load(src) {
    return new Promise(function (ok) {
      if (!src) return ok(null);
      var im = new Image(); im.onload = function () { ok(im); }; im.onerror = function () { ok(null); }; im.src = src;
    });
  }

  /* d: {nome, legenda, curtidas, comentarios, reposts, logo (url), foto (url)} */
  function drawMirror(d) {
    var W = 1080, H = 2160, PX = 40, PY = 40, PW = 1000, PH = 2080;
    var cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    var ctx = cv.getContext("2d");
    var SANS = '"DM Sans", Inter, system-ui, sans-serif';
    return Promise.all([load(d.logo), load(d.foto), document.fonts ? document.fonts.ready : null]).then(function (r) {
      var logo = r[0], foto = r[1];
      // brilho do LED + moldura
      ctx.save(); ctx.shadowColor = "rgba(255,208,122,.75)"; ctx.shadowBlur = 60;
      rr(ctx, PX, PY, PW, PH, 92); ctx.fillStyle = C.luz; ctx.fill(); ctx.restore();
      rr(ctx, PX + 12, PY + 12, PW - 24, PH - 24, 82); ctx.fillStyle = "#fff"; ctx.fill();
      var x0 = PX + 12, y0 = PY + 12, w0 = PW - 24, pad = 54;
      // barra de status
      ctx.fillStyle = C.ink; ctx.font = "600 36px " + SANS; ctx.textBaseline = "middle";
      ctx.fillText("14:52", x0 + pad + 20, y0 + 80);
      rr(ctx, x0 + w0 / 2 - 140, y0 + 44, 280, 74, 37); ctx.fill();
      ctx.fillStyle = "#fff"; [0, 1].forEach(function (i) { ctx.beginPath(); ctx.arc(x0 + w0 / 2 + 70 + i * 34, y0 + 81, 9, 0, 7); ctx.fill(); });
      ctx.fillStyle = C.ink; [0, 1, 2, 3].forEach(function (i) { rr(ctx, x0 + w0 - pad - 150 + i * 16, y0 + 92 - 10 - i * 7, 11, 10 + i * 7, 2); ctx.fill(); });
      rr(ctx, x0 + w0 - pad - 76, y0 + 66, 62, 30, 8); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
      rr(ctx, x0 + w0 - pad - 71, y0 + 71, 52, 20, 4); ctx.fillStyle = "#6CCB5F"; ctx.fill();
      // perfil
      var hy = y0 + 220;
      avatar(ctx, x0 + pad + 64, hy, 64, logo);
      ctx.font = "700 46px " + SANS; ctx.fillStyle = C.ink;
      var nome = fit(ctx, d.nome || "seu.negocio", w0 - pad * 2 - 290);
      ctx.fillText(nome, x0 + pad + 156, hy);
      badge(ctx, x0 + pad + 170 + ctx.measureText(nome).width, hy, 40);
      ctx.fillStyle = C.ink; [0, 1, 2].forEach(function (i) { ctx.beginPath(); ctx.arc(x0 + w0 - pad - 66 + i * 26, hy, 8, 0, 7); ctx.fill(); });
      // vidro com a foto
      var gx = x0 + 32, gy = hy + 100, gw = w0 - 64, gh = PH - 24 - (gy - y0) - 470;
      ctx.save(); rr(ctx, gx, gy, gw, gh, 12); ctx.clip();
      ctx.fillStyle = "#DFE4E1"; ctx.fillRect(gx, gy, gw, gh);
      if (foto) {
        var s = Math.max(gw / foto.width, gh / foto.height), fw = foto.width * s, fh = foto.height * s;
        ctx.drawImage(foto, gx + (gw - fw) / 2, gy + (gh - fh) * 0.4, fw, fh);
      }
      ctx.fillStyle = "rgba(255,255,255,.2)";
      ctx.beginPath(); ctx.moveTo(gx + gw * 0.62, gy); ctx.lineTo(gx + gw * 0.75, gy); ctx.lineTo(gx + gw * 0.15, gy + gh); ctx.lineTo(gx + gw * 0.02, gy + gh); ctx.fill();
      ctx.restore();
      // ações
      var ay = gy + gh + 40, ax = x0 + pad;
      ctx.font = "600 40px " + SANS; ctx.fillStyle = C.ink;
      icon(ctx, "heart", ax, ay, 64, { fill: C.coral }); ax += 76;
      ctx.fillText(d.curtidas || "0", ax, ay + 34); ax += ctx.measureText(d.curtidas || "0").width + 40;
      icon(ctx, "cmt", ax, ay, 62); ax += 74;
      ctx.fillText(d.comentarios || "0", ax, ay + 34); ax += ctx.measureText(d.comentarios || "0").width + 40;
      icon(ctx, "rep", ax, ay, 62); ax += 74;
      ctx.fillText(d.reposts || "0", ax, ay + 34); ax += ctx.measureText(d.reposts || "0").width + 40;
      icon(ctx, "send", ax, ay, 60);
      icon(ctx, "save", x0 + w0 - pad - 64, ay, 62);
      // legenda (até 2 linhas)
      var ly = ay + 120, maxW = w0 - pad * 2;
      ctx.font = "700 40px " + SANS; var nb = (d.nome || "seu.negocio") + " "; var nbw = ctx.measureText(nb).width;
      ctx.fillText(nb, x0 + pad, ly);
      ctx.font = "400 40px " + SANS;
      var words = (d.legenda || "").split(/\s+/), line = "", lines = [], first = true;
      words.forEach(function (w) {
        var lim = first ? maxW - nbw : maxW, t = line ? line + " " + w : w;
        if (ctx.measureText(t).width > lim && line) { lines.push(line); line = w; first = false; } else line = t;
      });
      if (line) lines.push(line);
      if (lines.length > 2) { lines = lines.slice(0, 2); lines[1] = fit(ctx, lines[1] + " …", maxW).replace(/ …$/, "…"); }
      lines.forEach(function (l, i) { ctx.fillText(l, x0 + pad + (i === 0 ? nbw : 0), ly + i * 52); });
      ctx.fillStyle = C.muted; ctx.font = "400 34px " + SANS;
      ctx.fillText("Há 1 hora", x0 + pad, ly + Math.max(1, lines.length) * 52 + 16);
      // barra inferior
      var ty = y0 + PH - 24 - 140, step = (w0 - pad * 2 - 60) / 4;
      ["home", "play", "send", "search"].forEach(function (n, i) { icon(ctx, n, x0 + pad + 4 + i * step, ty, 60); });
      avatar(ctx, x0 + pad + 34 + 4 * step, ty + 30, 32, logo);
      return cv;
    });
  }

  /* espelho numa parede de exemplo (para o PDF) */
  function drawWall(mirrorCanvas) {
    var W = 1600, H = 2600, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    var ctx = cv.getContext("2d");
    var g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#EEE6D8"); g.addColorStop(1, "#E3D8C5");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    var rg = ctx.createRadialGradient(W / 2, 900, 50, W / 2, 900, 900); rg.addColorStop(0, "rgba(255,240,205,.9)"); rg.addColorStop(1, "rgba(255,240,205,0)");
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    var fy = H - 260;
    ctx.fillStyle = "#FBF8F2"; ctx.fillRect(0, fy - 34, W, 34);
    ctx.fillStyle = "#8E5F3D"; ctx.fillRect(0, fy, W, H - fy);
    ctx.fillStyle = "#7F5334"; for (var x = 0; x < W; x += 300) ctx.fillRect(x, fy, 6, H - fy);
    var mh = 2160 * 0.95, mw = 1080 * 0.95, mx = (W - mw) / 2, my = fy - 70 - mh;
    ctx.save(); ctx.shadowColor = "rgba(60,38,18,.45)"; ctx.shadowBlur = 80; ctx.shadowOffsetX = 40; ctx.shadowOffsetY = 60;
    ctx.drawImage(mirrorCanvas, mx, my, mw, mh); ctx.restore();
    ctx.drawImage(mirrorCanvas, mx, my, mw, mh);
    // planta
    ctx.save(); ctx.translate(40, fy - 560); ctx.scale(3.4, 3.4);
    [["M60 104 C40 70 18 62 6 66 C22 74 38 88 52 108Z", "#3E8A5C"], ["M60 104 C80 66 104 58 116 62 C98 72 82 88 68 108Z", "#2F6B47"],
     ["M60 106 C52 60 58 26 66 8 C70 34 70 70 64 108Z", "#3E8A5C"], ["M60 106 C42 84 26 44 30 24 C44 46 54 76 64 106Z", "#2F6B47"],
     ["M60 106 C76 82 90 46 88 28 C76 50 66 78 58 106Z", "#4C9E6A"], ["M34 104 H86 L80 166 H40 Z", "#C9B79C"], ["M30 100 H90 V112 H30 Z", "#B9A585"]]
      .forEach(function (p) { ctx.fillStyle = p[1]; ctx.fill(new Path2D(p[0])); });
    ctx.restore();
    return cv;
  }

  window.CurtibaMirror = { draw: drawMirror, wall: drawWall };
})();
