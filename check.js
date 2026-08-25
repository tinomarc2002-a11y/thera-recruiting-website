/* check.js — Quiz-Logik des Recruiting-Checks (Fragen, Auswertung,
   Formularversand). Ausgelagert aus arbeitgebercheck.html. */

// ============== SECTIONS ==============
const sections = {
  reichweite: { name: 'Reichweite & Sichtbarkeit', max: 35, color: '#0f7bc8', text: '#0a5a94', soft: '#E9F3FB' },
  marke:      { name: 'Arbeitgebermarke',          max: 35, color: '#e8860f', text: '#a8630a', soft: '#FBEEDD' },
  prozess:    { name: 'Bewerbungsprozess',         max: 30, color: '#163d6b', text: '#0d2b4e', soft: '#E7EBF2' }
};

// Non-scored question groups (for the badge above the question)
const contextBadge   = { name: 'Kurz zu Ihrer Praxis', text: '#6B7280', soft: '#F0EEE8' };
const goldfrageBadge = { name: 'Die Goldfrage',        text: '#a8630a', soft: '#FBEEDD' };

// ============== QUESTIONS ==============
// Q1-Q3 + Q15 are NOT scored (context / goldfrage)
// Q4-Q14 sum to exactly 100 points across 3 sections
const questions = [
  // === Context (not scored) ===
  {
    id: 'q1',
    text: 'Welchen Therapiebereich deckt Ihre Praxis hauptsächlich ab?',
    hint: 'Nur für Benchmarking – fließt nicht in die Bewertung ein',
    type: 'single',
    scored: false,
    options: [
      { label: 'Physiotherapie', value: 'Physiotherapie' },
      { label: 'Ergotherapie', value: 'Ergotherapie' },
      { label: 'Logopädie', value: 'Logopädie' },
      { label: 'Mehrere Fachbereiche', value: 'Mehrere Fachbereiche' }
    ]
  },
  {
    id: 'q2',
    text: 'Wie viele offene Stellen haben Sie aktuell?',
    type: 'single',
    scored: false,
    options: [
      { label: 'Keine' },
      { label: '1 Stelle' },
      { label: '2 bis 3 Stellen' },
      { label: '4 oder mehr Stellen' }
    ]
  },
  {
    id: 'q3',
    text: 'Wie lange suchen Sie bereits nach Mitarbeitern?',
    type: 'single',
    scored: false,
    options: [
      { label: 'Unter 1 Monat' },
      { label: '1 bis 3 Monate' },
      { label: '3 bis 6 Monate' },
      { label: 'Über 6 Monate' }
    ]
  },
  {
    id: 'q4',
    text: 'Wie viele qualifizierte Bewerbungen erhalten Sie aktuell pro Monat?',
    hint: 'Anker-Frage – fließt nicht in die Bewertung ein',
    type: 'single',
    scored: false,
    options: [
      { label: 'Keine' },
      { label: '1 bis 2' },
      { label: '3 bis 5' },
      { label: 'Mehr als 5' }
    ]
  },

  // === Reichweite & Sichtbarkeit (35 Punkte) ===
  {
    id: 'q5',
    section: 'reichweite',
    text: 'Welche Recruiting-Kanäle nutzen Sie aktuell aktiv?',
    hint: 'Mehrfachauswahl möglich',
    type: 'multi',
    options: [
      { label: 'Jobportale (Stepstone, Indeed, therapie.de)', points: 1 },
      { label: 'Stellenanzeige auf eigener Website', points: 2 },
      { label: 'Mitarbeiter-Empfehlungsprogramm', points: 2 },
      { label: 'Social Media organisch (Instagram, Facebook)', points: 2 },
      { label: 'Bezahlte Social Media Ads (Meta, TikTok)', points: 4 },
      { label: 'Direktansprache / Active Sourcing', points: 3 },
      { label: 'Externe Recruiting-Agentur', points: 2 },
      { label: 'Eigene Karriere-Landingpage', points: 2 },
      { label: 'Keine davon – wir warten auf Initiativbewerbungen', points: 0, exclusive: true }
    ],
    maxPoints: 15
  },
  {
    id: 'q6',
    section: 'reichweite',
    text: 'Wie aktiv sprechen Sie passive Kandidaten an?',
    hint: 'Passive Kandidaten = Therapeuten in Festanstellung, die nicht aktiv suchen',
    type: 'single',
    options: [
      { label: 'Gar nicht – wir reagieren nur auf Bewerbungen', points: 0 },
      { label: 'Gelegentlich (Empfehlungen, Kontakte)', points: 4 },
      { label: 'Regelmäßig (Social Media, organisch)', points: 8 },
      { label: 'Systematisch (Ads, Direktansprache, Kampagnen)', points: 12 }
    ],
    maxPoints: 12
  },
  {
    id: 'q7',
    section: 'reichweite',
    text: 'Wie sichtbar ist Ihr Team auf Social Media (insb. Instagram)?',
    type: 'single',
    options: [
      { label: 'Gar nicht – kein Profil oder inaktiv', points: 0 },
      { label: 'Selten und unregelmäßig', points: 3 },
      { label: 'Regelmäßig (1× pro Woche)', points: 6 },
      { label: 'Sehr aktiv mit klarer Recruiting-Strategie', points: 8 }
    ],
    maxPoints: 8
  },

  // === Arbeitgebermarke (35 Punkte) ===
  {
    id: 'q8',
    section: 'marke',
    text: 'Können Bewerber auf Ihrer Website erkennen, warum sie ausgerechnet bei Ihnen arbeiten sollten?',
    type: 'single',
    options: [
      { label: 'Nein – keine eigene Karriereseite', points: 0 },
      { label: 'Standardseite ohne klaren USP', points: 3 },
      { label: 'Mit Team-Vorstellung und Benefits', points: 7 },
      { label: 'Vollständig: USP, Story, Team, Benefits, Gehalt', points: 10 }
    ],
    maxPoints: 10
  },
  {
    id: 'q9',
    section: 'marke',
    text: 'Wie aussagekräftig sind Ihre Stellenanzeigen?',
    type: 'single',
    options: [
      { label: 'Standardtext, oft kopiert', points: 0 },
      { label: 'Aufgaben + Anforderungen aufgelistet', points: 3 },
      { label: 'Mit Benefits und ungefährem Gehalt', points: 5 },
      { label: 'Mit klarem USP, Story, Benefits und konkreter Gehaltsangabe', points: 8 }
    ],
    maxPoints: 8
  },
  {
    id: 'q10',
    section: 'marke',
    text: 'Können Sie aus dem Stand 3 konkrete Gründe nennen, warum man bei IHNEN arbeiten sollte?',
    type: 'single',
    options: [
      { label: 'Nein, das müsste ich erst formulieren', points: 0 },
      { label: '1 bis 2 Gründe vielleicht', points: 2 },
      { label: 'Ja, 3 klare Gründe', points: 5 },
      { label: 'Ja – und mein Team kann sie auch nennen', points: 7 }
    ],
    maxPoints: 7
  },
  {
    id: 'q11',
    section: 'marke',
    text: 'Welche differenzierenden Benefits bieten Sie aktuell?',
    hint: 'Mehrfachauswahl möglich',
    type: 'multi',
    options: [
      { label: 'Flexible Arbeitszeiten', points: 2 },
      { label: '4-Tage-Woche', points: 2 },
      { label: 'Fortbildungsbudget + Freistellung', points: 2 },
      { label: 'Gesundheitsbudget / EGYM Wellpass', points: 1 },
      { label: 'Betriebliche Altersvorsorge', points: 1 },
      { label: 'Jobrad / Tankgutschein', points: 1 },
      { label: 'Erfolgsbonus / Provision', points: 1 },
      { label: 'Mitarbeiter-Events / Team-Wochenenden', points: 1 },
      { label: 'Keine davon', points: 0, exclusive: true }
    ],
    maxPoints: 10
  },

  // === Bewerbungsprozess (30 Punkte) ===
  {
    id: 'q12',
    section: 'prozess',
    text: 'Wie aufwendig ist eine Bewerbung bei Ihnen?',
    type: 'single',
    options: [
      { label: 'Lebenslauf + Anschreiben erforderlich', points: 0 },
      { label: 'Lebenslauf ausreichend', points: 4 },
      { label: 'Kurzes Online-Formular', points: 8 },
      { label: 'Unter 60 Sekunden, ohne Lebenslauf', points: 12 }
    ],
    maxPoints: 12
  },
  {
    id: 'q13',
    section: 'prozess',
    text: 'Wie schnell antworten Sie auf eingehende Bewerbungen?',
    type: 'single',
    options: [
      { label: 'Länger als 1 Woche', points: 0 },
      { label: '3 bis 7 Tage', points: 3 },
      { label: '1 bis 2 Tage', points: 7 },
      { label: 'Innerhalb von 24 Stunden', points: 10 }
    ],
    maxPoints: 10
  },
  {
    id: 'q14',
    section: 'prozess',
    text: 'Haben Sie einen strukturierten Bewerbungs- und Probearbeits-Prozess?',
    type: 'single',
    options: [
      { label: 'Nein – läuft spontan je nach Bewerber', points: 0 },
      { label: 'Grob, nicht dokumentiert', points: 3 },
      { label: 'Klar strukturiert (Gespräch + Probearbeit)', points: 6 },
      { label: 'Mit Schnuppertag, Hospitation und Dokumentation', points: 8 }
    ],
    maxPoints: 8
  },

  // === Goldfrage (separat ausgewertet) ===
  {
    id: 'q15',
    text: 'Würden Sie sich selbst heute bei Ihrer Praxis bewerben?',
    hint: 'Goldfrage – bitte ehrlich antworten',
    type: 'single',
    scored: false,
    isGoldfrage: true,
    options: [
      { label: 'Definitiv nicht', value: 0 },
      { label: 'Eher nicht', value: 1 },
      { label: 'Wahrscheinlich', value: 2 },
      { label: 'Definitiv', value: 3 }
    ]
  }
];

// ============== INSIGHTS LIBRARY (per question) ==============
// Each insight ties directly back to a recruiting-service offering
const insightsLib = {
  q5: {
    title: 'Kanalmix erweitern – raus aus der Jobportal-Falle',
    text: 'Wer nur auf Jobportalen sucht, erreicht ausschließlich aktive Wechsler (rund 20% des Marktes). Die starken Therapeuten sind passiv – die erreichen Sie nur über Social Media Ads, Direktansprache und eine gezielte Außenwirkung.'
  },
  q6: {
    title: 'Passive Kandidaten systematisch ansprechen',
    text: 'Solange Sie nur auf Bewerbungen reagieren, kämpfen Sie um die 20% wechselbereiten Therapeuten gegen alle anderen Praxen. Wer passive Therapeuten systematisch mit Ads und Direktansprache anspricht, verdoppelt seine Auswahl – und gewinnt die Stärksten.'
  },
  q7: {
    title: 'Team auf Social Media sichtbar machen',
    text: 'Instagram ist heute der wichtigste Vertrauensanker im Recruiting. Wenn Bewerber Ihr Team, Ihre Atmosphäre und Ihren Alltag nicht sehen können, bewerben sie sich nicht. Regelmäßige Team-Inhalte ändern das fundamental.'
  },
  q8: {
    title: 'Eigene Karriereseite mit klarem USP aufbauen',
    text: 'Eine Karriereseite mit klarem "Warum bei uns?"-Statement, Team, Benefits und Gehalt vervielfacht die Bewerbungen aus jedem Kanal. Ohne sie verpufft jeder Ad-Euro – egal wie gut die Anzeige ist.'
  },
  q9: {
    title: 'Stellenanzeigen radikal überarbeiten',
    text: 'Standard-Stellenanzeigen ohne Gehalt und ohne Story filtern genau die guten Therapeuten heraus. Konkrete Gehaltsangabe + Praxis-Story + klare Benefits erhöhen die Bewerbungsrate erfahrungsgemäß um Faktor 2 bis 3.'
  },
  q10: {
    title: 'Eigenen USP klar formulieren',
    text: 'Wenn Sie selbst nicht aus dem Stand 3 Gründe nennen können, warum jemand bei IHNEN arbeiten soll – wie sollen es Ihre Anzeigen, Ihre Website oder Ihre Ads tun? Das ist der wichtigste Schritt vor allem anderen.'
  },
  q11: {
    title: 'Differenzierende Benefits einführen',
    text: 'Mit den richtigen Benefits (4-Tage-Woche, Fortbildungsbudget mit Freistellung, EGYM Wellpass) heben Sie sich klar von Standard-Praxen ab – und geben Ihrem Marketing ein konkretes Versprechen, mit dem es werben kann.'
  },
  q12: {
    title: 'Bewerbungsprozess radikal vereinfachen',
    text: 'Lebenslauf und Anschreiben sind heute Conversion-Killer. Eine Bewerbung in unter 60 Sekunden ohne Unterlagen vervielfacht die Bewerbungen – erfahrungsgemäß Faktor 3 bis 5. Das ist der schnellste Hebel überhaupt.'
  },
  q13: {
    title: 'Antwortzeit auf unter 24 Stunden bringen',
    text: 'Bewerber sind heute innerhalb von Tagen bei der nächsten Praxis. Wer länger als 48 Stunden braucht, verliert die guten Kandidaten an schnellere Praxen. Eine 24h-Antwortgarantie ist Pflicht.'
  },
  q14: {
    title: 'Strukturierten Recruiting-Prozess etablieren',
    text: 'Ohne klaren Ablauf (Gespräch → Hospitation/Probearbeit → Entscheidung) wirken Sie unprofessionell – und verlieren Bewerber, die mehrere Praxen vergleichen. Ein strukturierter Prozess ist ein Auswahl-Kriterium für gute Therapeuten.'
  }
};

// ============== STATE ==============
let currentIdx = 0;
let navDirection = 'forward';
let answers = {};
let quizStarted = false;

// ============== INIT ==============
document.getElementById('year').textContent = new Date().getFullYear();

function startQuiz() {
  if (!quizStarted) {
    quizStarted = true;
    renderQuestion(0);
  }
}

// ============== RENDER ==============
function renderQuestion(idx) {
  const q = questions[idx];
  currentIdx = idx;

  // Re-trigger directional slide animation
  const card = document.getElementById('questionCard');
  card.style.animation = 'none';
  card.offsetHeight;
  const anim = navDirection === 'back' ? 'slideInLeft' : 'slideInRight';
  card.style.animation = anim + ' 0.4s cubic-bezier(0.22, 1, 0.36, 1)';

  // Section badge (colored, with emoji)
  const sectionLabel = document.getElementById('sectionLabel');
  let badge = null;
  if (q.section && sections[q.section]) {
    badge = sections[q.section];
  } else if (q.isGoldfrage) {
    badge = goldfrageBadge;
  } else if (q.scored === false) {
    badge = contextBadge;
  }
  if (badge) {
    sectionLabel.innerHTML = `<span class="section-badge" style="background:${badge.soft}; color:${badge.text};">${badge.name}</span>`;
    sectionLabel.classList.remove('hidden');
  } else {
    sectionLabel.classList.add('hidden');
  }

  document.getElementById('questionText').textContent = q.text;
  const hintEl = document.getElementById('questionHint');
  hintEl.textContent = q.hint || '';
  hintEl.style.display = q.hint ? 'block' : 'none';

  document.getElementById('currentStep').textContent = idx + 1;
  const pct = Math.round((idx) / questions.length * 100);
  document.getElementById('percentLabel').textContent = `${pct}% abgeschlossen`;
  document.getElementById('progressFill').style.width = pct + '%';

  // Render options
  const list = document.getElementById('optionsList');
  list.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.setAttribute('data-type', q.type);
    btn.setAttribute('data-idx', i);
    btn.innerHTML = `<span class="opt-label">${opt.label}</span><span class="check"></span>`;
    btn.onclick = () => selectOption(i);

    // Restore previous selection
    const existing = answers[q.id];
    if (q.type === 'single' && existing !== undefined && existing === i) {
      btn.classList.add('selected');
    }
    if (q.type === 'multi' && Array.isArray(existing) && existing.includes(i)) {
      btn.classList.add('selected');
    }
    list.appendChild(btn);
  });

  document.getElementById('btnBack').disabled = idx === 0;
  document.getElementById('btnNext').disabled = !hasAnswer(q);
  document.getElementById('nextLabel').textContent = idx === questions.length - 1 ? 'Ergebnis anzeigen' : 'Weiter';
}

function hasAnswer(q) {
  const a = answers[q.id];
  if (q.type === 'single') return a !== undefined;
  if (q.type === 'multi') return Array.isArray(a) && a.length > 0;
  return false;
}

function selectOption(optIdx) {
  const q = questions[currentIdx];

  if (q.type === 'single') {
    answers[q.id] = optIdx;
    document.querySelectorAll('.option').forEach((el, i) => {
      el.classList.toggle('selected', i === optIdx);
    });
    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        nextQuestion();
      } else {
        document.getElementById('btnNext').disabled = false;
      }
    }, 280);
  } else if (q.type === 'multi') {
    if (!Array.isArray(answers[q.id])) answers[q.id] = [];
    const arr = answers[q.id];
    const opt = q.options[optIdx];

    if (opt.exclusive) {
      if (arr.includes(optIdx)) {
        answers[q.id] = [];
      } else {
        answers[q.id] = [optIdx];
      }
    } else {
      const exclusiveIdx = q.options.findIndex(o => o.exclusive);
      if (exclusiveIdx >= 0) {
        const ei = arr.indexOf(exclusiveIdx);
        if (ei >= 0) arr.splice(ei, 1);
      }
      const i = arr.indexOf(optIdx);
      if (i >= 0) arr.splice(i, 1);
      else arr.push(optIdx);
    }

    document.querySelectorAll('.option').forEach((el, i) => {
      el.classList.toggle('selected', answers[q.id].includes(i));
    });
    document.getElementById('btnNext').disabled = !hasAnswer(q);
  }
}

function nextQuestion() {
  if (currentIdx < questions.length - 1) {
    navDirection = 'forward';
    renderQuestion(currentIdx + 1);
    document.getElementById('quiz').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    showResult();
  }
}

function prevQuestion() {
  if (currentIdx > 0) {
    navDirection = 'back';
    renderQuestion(currentIdx - 1);
    document.getElementById('quiz').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ============== SCORE ==============
function calculateScore() {
  let total = 0;
  const sectionScores = {};
  Object.keys(sections).forEach(k => sectionScores[k] = { earned: 0, max: sections[k].max, name: sections[k].name });

  const questionScores = {}; // per question, for picking weakest

  questions.forEach(q => {
    if (q.scored === false) return;

    const a = answers[q.id];
    let pts = 0;
    if (q.type === 'single' && a !== undefined) {
      pts = q.options[a].points;
    } else if (q.type === 'multi' && Array.isArray(a)) {
      pts = a.reduce((sum, idx) => sum + q.options[idx].points, 0);
      if (q.maxPoints) pts = Math.min(pts, q.maxPoints);
    }

    total += pts;
    if (q.section) sectionScores[q.section].earned += pts;
    questionScores[q.id] = { earned: pts, max: q.maxPoints || 0, ratio: q.maxPoints ? pts / q.maxPoints : 1 };
  });

  return { total: Math.min(total, 100), sectionScores, questionScores };
}

function getWeakestQuestions(questionScores, n = 3) {
  return Object.entries(questionScores)
    .map(([qid, s]) => ({ qid, ratio: s.ratio }))
    .sort((a, b) => a.ratio - b.ratio)
    .slice(0, n)
    .map(r => r.qid);
}

function getScoreTier(score) {
  if (score <= 49) return {
    badge: 'kritisch',
    badgeText: 'Kritischer Handlungsbedarf',
    title: 'Hier liegt sehr viel Potenzial.',
    text: 'Ihre Praxis verliert aktuell mit hoher Wahrscheinlichkeit Bewerber an attraktivere Arbeitgeber. Die gute Nachricht: Schon mit wenigen gezielten Maßnahmen verändern Sie das Bild deutlich – die Hebel unten zeigen, wo Sie ansetzen können.',
    color: '#C03434'
  };
  if (score <= 69) return {
    badge: 'durchschnitt',
    badgeText: 'Durchschnittlicher Arbeitgeber',
    title: 'Sie liegen im Mittelfeld.',
    text: 'Ihre Praxis ist auf einem soliden Niveau – aber nicht herausragend. Bewerber haben heute die Wahl und entscheiden sich für die attraktivsten Praxen. Mit gezielten Optimierungen schaffen Sie den Sprung in die Top-Liga.',
    color: '#E89414'
  };
  if (score <= 84) return {
    badge: 'attraktiv',
    badgeText: 'Attraktiver Arbeitgeber',
    title: 'Sie sind überdurchschnittlich attraktiv.',
    text: 'Sie sind bereits attraktiver als die meisten Praxen Ihrer Region. Jetzt geht es darum, die verbleibenden Hebel zu nutzen und Ihre Stärken systematisch nach außen zu kommunizieren.',
    color: '#C9A21F'
  };
  return {
    badge: 'top',
    badgeText: 'Top-Arbeitgeber',
    title: 'Sie gehören zu den Top-Arbeitgebern.',
    text: 'Beeindruckend – Sie machen es bereits sehr gut. Jetzt geht es darum, diese Position systematisch sichtbar zu machen und gezielt für die Mitarbeitergewinnung einzusetzen. Hier liegt der eigentliche Hebel.',
    color: '#1F7A2F'
  };
}

function getGoldfrageInsight(goldValue, score) {
  // goldValue: 0 = definitiv nicht, 1 = eher nicht, 2 = wahrscheinlich, 3 = definitiv
  if (goldValue === 0) return {
    title: 'Sie würden sich selbst nicht bewerben.',
    text: score >= 70
      ? `Trotz solidem Score (${score}/100) gibt es offenbar tieferliegende Themen, die selbst Sie als Inhaber stören. Das ist der wichtigste Ansatzpunkt – egal was die Punktzahl sagt.`
      : 'Das ist eine ehrliche Antwort – und sie deckt sich mit dem Score. Genau hier liegt der Ansatzpunkt: Was würde sich für Sie selbst ändern müssen, damit Sie wieder gerne hier arbeiten würden?'
  };
  if (goldValue === 1) return {
    title: 'Sie haben Zweifel an Ihrer eigenen Praxis.',
    text: 'Diese Antwort ist wertvoll: Sie sehen ehrlich, dass nicht alles rund läuft. Die Hebel unten helfen, genau die Punkte anzugehen, die Sie selbst stören würden.'
  };
  if (goldValue === 2) return {
    title: 'Sie würden sich wahrscheinlich bewerben.',
    text: 'Ein gutes Zeichen – die Grundlagen passen. Mit gezielten Verbesserungen wird aus "wahrscheinlich" ein klares "definitiv" – und genau das wirkt auch nach außen.'
  };
  return {
    title: 'Sie würden sich definitiv selbst bewerben.',
    text: score >= 70
      ? 'Das passt zum Score – Sie wissen, was Sie haben, und stehen voll dahinter. Diese Authentizität ist Ihr stärkstes Recruiting-Argument. Jetzt muss es nur noch sichtbar werden.'
      : `Interessant: Sie würden sich selbst bewerben, der Score liegt aber bei ${score}/100. Das deutet darauf hin, dass Ihre Praxis besser ist, als sie nach außen wirkt – oder Sie zu wenig vergleichen. Beides klären wir gerne im Gespräch.`
  };
}

// ============== SHOW RESULT ==============
function showResult() {
  const { total, sectionScores, questionScores } = calculateScore();
  const tier = getScoreTier(total);
  const weakest = getWeakestQuestions(questionScores, 3);

  document.getElementById('quiz').style.display = 'none';
  document.getElementById('result').classList.add('active');

  // === Score Badge ===
  const badge = document.getElementById('scoreBadge');
  badge.className = 'score-badge ' + tier.badge;
  badge.querySelector('.emoji').style.background = tier.color;
  badge.querySelector('.text').textContent = tier.badgeText;

  document.getElementById('scoreTitle').textContent = tier.title;
  document.getElementById('scoreText').textContent = tier.text;

  // === Gauge ===
  const gauge = document.getElementById('gaugeFill');
  gauge.setAttribute('stroke', tier.color);
  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (total / 100) * circumference;

  setTimeout(() => {
    gauge.style.strokeDashoffset = offset;
    animateNumber(document.getElementById('scoreNum'), 0, total, 1500);
  }, 200);

  // === Category breakdown ===
  const breakdownList = document.getElementById('breakdownList');
  breakdownList.innerHTML = '';
  Object.entries(sectionScores).forEach(([key, s]) => {
    const pct = Math.round((s.earned / s.max) * 100);
    const row = document.createElement('div');
    row.className = 'breakdown-row';
    row.innerHTML = `
      <div class="breakdown-row-head">
        <span class="label">${s.name}</span>
        <span class="value"><strong>${s.earned}</strong> von ${s.max} Punkten · ${pct}%</span>
      </div>
      <div class="breakdown-bar">
        <div class="breakdown-bar-fill" style="background: ${sections[key].color};"></div>
      </div>
    `;
    breakdownList.appendChild(row);
    // Animate bar
    setTimeout(() => {
      row.querySelector('.breakdown-bar-fill').style.width = pct + '%';
    }, 100);
  });

  // === Goldfrage Reality Check ===
  const goldAnswer = answers['q15'];
  if (goldAnswer !== undefined) {
    const goldInsight = getGoldfrageInsight(goldAnswer, total);
    document.getElementById('goldfrageTitle').textContent = goldInsight.title;
    document.getElementById('goldfrageText').textContent = goldInsight.text;
    document.getElementById('goldfrageBox').style.display = '';
  } else {
    document.getElementById('goldfrageBox').style.display = 'none';
  }

  // === Insights (3 weakest questions) ===
  const insightList = document.getElementById('insightList');
  insightList.innerHTML = '';
  weakest.forEach((qid, i) => {
    const insight = insightsLib[qid];
    if (!insight) return;
    const div = document.createElement('div');
    div.className = 'insight';
    div.innerHTML = `
      <div class="insight-icon">${i + 1}</div>
      <div>
        <h4>${insight.title}</h4>
        <p>${insight.text}</p>
      </div>
    `;
    insightList.appendChild(div);
  });

  document.getElementById('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function animateNumber(el, from, to, duration) {
  const start = performance.now();
  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (to - from) * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// Smooth scroll to booking with header offset
function scrollToBooking(e) {
  e.preventDefault();
  const target = document.getElementById('bookingAnchor');
  if (!target) return;
  const headerOffset = 100;
  const y = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
  window.scrollTo({ top: y, behavior: 'smooth' });
}

// ============== FORM SUBMIT ==============
// Endpoints
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xaqzewdo';
const THANK_YOU_URL = '/danke';

// Build a complete, human-readable payload of every answer + scores
function buildLeadPayload(contact) {
  const { total, sectionScores } = calculateScore();
  const tier = getScoreTier(total);

  const payload = {};

  // Contact (top of the email)
  payload['Name'] = contact.name;
  payload['Telefon'] = contact.telefon;
  payload['E-Mail'] = contact.email;

  // Headline score
  payload['Gesamt-Score'] = total + ' / 100 – ' + tier.badgeText;

  // Category scores
  Object.values(sectionScores).forEach(function (s) {
    payload[s.name] = s.earned + ' / ' + s.max;
  });

  // Goldfrage
  const gold = answers['q15'];
  if (gold !== undefined) {
    payload['Würde sich selbst bewerben'] = questions[14].options[gold].label;
  }

  // Per-question answers (numbered, readable) + a combined summary block
  const lines = [];
  lines.push('═══ KONTAKT ═══');
  lines.push('Name:     ' + contact.name);
  lines.push('Telefon:  ' + contact.telefon);
  lines.push('E-Mail:   ' + contact.email);
  lines.push('');
  lines.push('═══ ERGEBNIS ═══');
  lines.push('Gesamt-Score: ' + total + ' / 100 (' + tier.badgeText + ')');
  Object.values(sectionScores).forEach(function (s) {
    lines.push(s.name + ': ' + s.earned + ' / ' + s.max);
  });
  lines.push('');
  lines.push('═══ ALLE ANTWORTEN ═══');

  questions.forEach(function (q, qi) {
    const a = answers[q.id];
    let answerText = '— (übersprungen)';
    if (q.type === 'single' && a !== undefined) {
      answerText = q.options[a].label;
    } else if (q.type === 'multi' && Array.isArray(a) && a.length) {
      answerText = a.map(function (idx) { return q.options[idx].label; }).join(', ');
    }
    const num = String(qi + 1).padStart(2, '0');
    payload[num + '. ' + q.text] = answerText;
    lines.push(num + '. ' + q.text);
    lines.push('    → ' + answerText);
  });

  // One readable block (guarantees clean formatting in the email)
  payload['Komplette Auswertung'] = lines.join('\n');

  // Email subject + reply-to
  payload['_subject'] = 'Recruiting-Check: ' + contact.name + ' – Score ' + total + '/100';
  if (window.trHerkunft) Object.assign(payload, trHerkunft());
  payload['email'] = contact.email; // Formspree uses this as reply-to

  return { payload: payload, total: total };
}

function submitBooking(e) {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  const contact = {
    name: (fd.get('name') || '').trim(),
    telefon: (fd.get('telefon') || '').trim(),
    email: (fd.get('email') || '').trim()
  };

  // Sending state
  const btn = form.querySelector('.booking-submit');
  if (btn) {
    btn.disabled = true;
    btn.style.opacity = '0.7';
    btn.textContent = 'Wird gesendet …';
  }

  const built = buildLeadPayload(contact);

  fetch(FORMSPREE_ENDPOINT, {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(built.payload)
  })
  .then(function (res) {
    if (!res.ok) console.error('Formspree responded with status', res.status);
  })
  .catch(function (err) { console.error('Lead submit error:', err); })
  .finally(function () {
    window.location.href = THANK_YOU_URL;
  });

  return false;
}

// Initialize first question
renderQuestion(0);
