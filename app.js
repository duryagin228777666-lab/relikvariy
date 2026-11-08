(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel) => document.querySelector(sel);

  /* ---------- Data (fictional titles) ---------- */
  const HALLS = [
    { id: "knights", name: "Рыцари", desc: "“Once more unto the breach.” — Shakespeare" },
    { id: "curses", name: "Проклятия", desc: "“Uneasy lies the head that wears a crown.” — Shakespeare" },
    { id: "cities", name: "Мёртвые города", desc: "“For whom the bell tolls.” — John Donne" },
    { id: "wars", name: "Битвы", desc: "“Cry havoc, and let slip the dogs of war.” — Shakespeare" },
  ];
  const BOOKS = [
    { title: "Терновый венец", scene: "wreath", attr: "crown", hall: "curses", author: "Ирма Вольская", genre: "тёмное фэнтези", issues: 6, price: "990 ₽", seal: true,
      desc: "Король не может снять корону: она проросла ему в череп." },
    { title: "Рыцарь без лица", scene: "helm", attr: "knight", hall: "knights", author: "Глеб Сорокин", genre: "рыцарский хоррор", issues: 4, price: "760 ₽", light: true,
      desc: "Под забралом пусто уже сто лет, но доспех всё ещё исполняет клятву." },
    { title: "Колокола мёртвого града", scene: "bell", attr: "wings", hall: "cities", author: "Вера Ольх", genre: "мистика", issues: 8, price: "1 240 ₽",
      desc: "Город, где каждый удар колокола забирает одно имя." },
    { title: "Последний оруженосец", scene: "sword", attr: "swords", hall: "knights", author: "Тимур Аскаров", genre: "приключения", issues: 5, price: "820 ₽", seal: true,
      desc: "Мальчик несёт меч мёртвого господина к самому краю мира." },
    { title: "Дом восковых святых", scene: "candle", attr: "thorns", hall: "cities", author: "Ника Леви", genre: "готика", issues: 3, price: "650 ₽", light: true,
      desc: "Монастырь, где святые тают, если им перестают молиться." },
    { title: "Щит покаяния", scene: "shield", attr: "knight", hall: "knights", author: "Артём Грач", genre: "военная драма", issues: 7, price: "990 ₽",
      desc: "Орден, который сорок лет искупает одну-единственную битву." },
    { title: "Башня без дверей", scene: "tower", attr: "wings", hall: "cities", author: "Ульяна Мрак", genre: "детектив-хоррор", issues: 2, price: "540 ₽", seal: true,
      desc: "Кто-то внутри каждую ночь зажигает свет. Входа в башню нет." },
    { title: "Чаша пепла", scene: "chalice", attr: "crown", hall: "curses", author: "Дмитрий Вран", genre: "тёмное фэнтези", issues: 6, price: "880 ₽", light: true,
      desc: "Испивший из чаши помнит все свои жизни сразу." },
    { title: "Ржавый пилигрим", scene: "skull", attr: "thorns", hall: "knights", author: "Лев Тень", genre: "роуд-хоррор", issues: 4, price: "720 ₽",
      desc: "Доспех идёт к святыне сам. Пилигрим внутри давно не дышит." },
    { title: "Ночь тысячи клинков", scene: "swords", attr: "swords", hall: "wars", author: "Олег Сумрак", genre: "эпос", issues: 9, price: "1 390 ₽", seal: true,
      desc: "Тысяча мечей воткнута в поле. Каждый ждёт своего хозяина." },
  ];
  const COVER_W = 120;
  const COVER_H = 170;
  const BG_PX = 200; /* card-background engraving resolution; upscaled ~3.5x for chunky pixels */

  /* ---------- Render catalog ---------- */
  const rowHTML = (b, i) => `
    <li class="row" id="book-${i + 1}" data-hall="${b.hall}">
      <div class="row__bg" aria-hidden="true"><canvas width="${BG_PX}" height="${BG_PX}"></canvas></div>
      <span class="row__num" aria-hidden="true"></span>
      <div class="row__body">
        <p class="row__kicker reveal">${b.genre} · ${b.issues} выпусков</p>
        <h3 class="row__title reveal">${b.title}</h3>
        <p class="row__desc reveal">${b.desc}</p>
        <div class="row__meta"><span>Автор — ${b.author}</span><span class="row__price">${b.price}</span></div>
      </div>
      <figure class="cover reveal">
        ${b.seal ? `<span class="cover__seal" aria-hidden="true">✠</span>` : ""}
        <div class="frame">
          <canvas width="${COVER_W}" height="${COVER_H}" aria-label="Обложка «${b.title}»"></canvas>
        </div>
      </figure>
    </li>`;
  $("#list").innerHTML = BOOKS.map(rowHTML).join("");

  $("#halls").innerHTML = HALLS.map((h) => {
    const first = BOOKS.findIndex((b) => b.hall === h.id) + 1;
    const count = BOOKS.filter((b) => b.hall === h.id).length;
    return `<li><a href="#book-${first}"><span class="halls__name">${h.name}</span><span class="halls__count">(${count})</span><span class="halls__desc" lang="en">${h.desc}</span></a></li>`;
  }).join("");

  /* ---------- Pixel art + shimmer on hover ---------- */
  const SHIMMER_MS = 110;
  const shimmer = (target, paint, seed) => {
    let timer = null;
    target.addEventListener("pointerenter", () => {
      if (reduceMotion) return;
      timer = setInterval(() => paint(Math.floor(Math.random() * 1e9)), SHIMMER_MS);
    });
    target.addEventListener("pointerleave", () => { clearInterval(timer); paint(seed); });
  };
  document.querySelectorAll(".row").forEach((row, i) => {
    const b = BOOKS[i];
    const seed = 11 + i * 97;
    window.PixelArt.renderBg(row.querySelector(".row__bg canvas"), b.attr, seed);
    const paint = window.PixelArt.render(row.querySelector(".cover canvas"), b.scene, { seed, light: !!b.light });
    shimmer(row, paint, seed);
  });
  const heroArt = $("#heroArt");
  shimmer(heroArt, window.PixelArt.render(heroArt, "hero", { seed: 3 }), 3);

  /* ---------- Fit giant words to their container width ---------- */
  const FIT_PROBE_PX = 100;
  const fitAll = () => {
    document.querySelectorAll(".fit").forEach((el) => {
      const parent = el.parentElement;
      const cs = getComputedStyle(parent);
      const avail = parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      el.style.fontSize = `${FIT_PROBE_PX}px`;
      el.style.fontSize = `${(FIT_PROBE_PX * avail / el.scrollWidth) * 0.995}px`;
    });
    const t1 = $(".t1");
    $(".hero__title").style.setProperty("--t1fs", t1.style.fontSize);
  };
  let fitTimer = null;
  window.addEventListener("resize", () => { clearTimeout(fitTimer); fitTimer = setTimeout(fitAll, 120); });
  fitAll();
  /* fonts.ready can resolve before the display font even starts loading,
     so request it explicitly and refit on every font load and on page load. */
  document.fonts.load('900 100px "Alumni Sans"').then(fitAll, fitAll);
  document.fonts.addEventListener("loadingdone", fitAll);
  window.addEventListener("load", fitAll);

  /* Rows are rendered by JS, so a #book-N anchor in the URL needs a manual scroll. */
  if (location.hash.startsWith("#book-")) {
    const target = document.getElementById(location.hash.slice(1));
    if (target) window.addEventListener("load", () => target.scrollIntoView({ behavior: "instant" }));
  }

  /* ---------- Marquee ---------- */
  const WORDS = ["Новые поступления", "Ручная печать", "Тираж — сто экземпляров", "Доспехи в комплект не входят", "Открыто до полуночи"];
  const chunk = WORDS.map((w) => `<span>${w}</span><span class="cross">✠</span>`).join("");
  $("#marquee").innerHTML = chunk.repeat(4);

  /* ---------- Clock in Roman numerals ---------- */
  const toRoman = (n) => {
    if (n === 0) return "N";
    const map = [[50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
    let out = "";
    for (const [v, s] of map) while (n >= v) { out += s; n -= v; }
    return out;
  };
  const CLOCK_TICK_MS = 30000;
  const tickClock = () => {
    const now = new Date();
    $("#clock").textContent = `${toRoman(now.getHours())} · ${toRoman(now.getMinutes())}`;
  };
  tickClock();
  setInterval(tickClock, CLOCK_TICK_MS);

  /* ---------- Rotating quotes (public-domain authors) ---------- */
  const QUOTES = [
    ["All that we see or seem is but a dream within a dream.", "Edgar Allan Poe"],
    ["Deep into that darkness peering, long I stood there, wondering, fearing.", "Edgar Allan Poe, The Raven"],
    ["The oldest and strongest emotion of mankind is fear.", "H. P. Lovecraft"],
    ["Memento mori.", "Latin proverb"],
    ["Hell is empty and all the devils are here.", "William Shakespeare, The Tempest"],
  ];
  const QUOTE_MS = 7000;
  const quoteEl = $("#quote");
  let quoteIdx = 0;
  const showQuote = () => {
    const [text, who] = QUOTES[quoteIdx];
    quoteEl.querySelector("blockquote").textContent = `“${text}”`;
    quoteEl.querySelector("figcaption").textContent = `— ${who}`;
  };
  showQuote();
  if (!reduceMotion) {
    setInterval(() => {
      quoteEl.classList.add("out");
      setTimeout(() => {
        quoteIdx = (quoteIdx + 1) % QUOTES.length;
        showQuote();
        quoteEl.classList.remove("out");
      }, 500);
    }, QUOTE_MS);
  }

  /* ---------- Reveal on scroll ----------
     Observe the unclipped containers: a clip-path'd element has an empty
     intersection rect, so observing .reveal itself never fires. */
  const REVEAL_STAGGER_MS = 110;
  const REVEAL_CLEAR_MS = 1600;
  const revealIn = (container) => {
    container.querySelectorAll(".reveal").forEach((el, i) => {
      el.style.transitionDelay = `${i * REVEAL_STAGGER_MS}ms`;
      el.classList.add("in");
      setTimeout(() => { el.style.transitionDelay = ""; }, REVEAL_CLEAR_MS);
    });
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      revealIn(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".intro, .row").forEach((el) => {
    if (reduceMotion) revealIn(el);
    else io.observe(el);
  });
})();
