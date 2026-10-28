(() => {
const L = new Map();
const add = (text, slow = false) => segments(text).forEach(sg => { const k = vkey(sg, slow); if (!L.has(k)) L.set(k, { k, t: sg, slow }); });
const stat = [];
// numbers
for (let n = 0; n <= 200; n++) add(String(n));
add('hmm');
// words
ALL_WORDS.forEach(w => { add(w, true); add(w); add(`Good try! This word is ${w}. We'll come back to it.`); add(`That one says ${w}. Try again!`); add(`Now you say it. ${w}`); });
Object.values(CLUES).forEach(c => add(c));
['Perfect!','You said it!','Amazing!','Super star!','You found it!','Great job!','Yay!','Almost! Listen.','Now you say it.', 'Find the word', "Let's try this one again. Find the word"].forEach(t => add(t));
// math
for (let a = 0; a <= 20; a++) for (let b = 0; b <= 20; b++){
  if (a + b <= 20){ add(`What is ${a} plus ${b}?`); add(`${a} plus ${b} is ${a + b}!`); }
  if (b < a){ add(`What is ${a} take away ${b}?`); add(`${a} take away ${b} is ${a - b}!`); }
}
['Count the stars and try again!', "Let's count together!", 'Now you try!', 'What comes after?', 'What comes next?', 'What number is missing?', 'Count with me:', 'Yes!'].forEach(t => add(t));
// shapes
const shapes = [...new Set(SHAPE_STAGES.flatMap(s => s.set))];
shapes.forEach(sh => { const L2 = shapeLabel(sh);
  add(`Find the ${L2}!`); add(`Yes! That's ${withA(L2)}!`); add(`That's ${withA(L2)}.`);
  ['sides', 'corners'].forEach(w => add(`How many ${w} does the ${L2} have?`));
  if (PTS[sh]) ['sides', 'corners'].forEach(w => add(`Yes! ${cap(withA(L2))} has ${PTS[sh].length} ${w}!`));
});
add("Let's count the corners together!");
// clocks
for (let h = 1; h <= 12; h++) [0, 30].forEach(m => { const T = timeSay(h, m);
  add(`The short hand points to the hour. It's on ${h}.`); add(`So it's ${T}! Now you try!`); add(`Yes! It's ${T}!`);
  add(`Find the clock that says ${T}!`); add(`Yes! That clock says ${T}!`); add(`That clock says ${T}.`); add(`Find ${T}!`); });
["The long hand is on 12. That means o'clock.", 'The long hand is on 6. That means thirty.', 'What time is it?',
 "The short hand shows the hour. The long hand on 6 means thirty.", "The short hand shows the hour. The long hand on 12 means o'clock."].forEach(t => add(t));
// coins
Object.entries(COINS).forEach(([k, c]) => { add(`Find the ${k}!`); add(`That's a ${k}.`); add(`How much is a ${k} worth?`);
  add(`Not quite. A ${k} is worth ${centsSay(c.v)}. Now you try!`); add(`Yes! That's a ${k}. It's worth ${centsSay(c.v)}!`); add(`Yes! A ${k} is worth ${centsSay(c.v)}!`); });
for (let c = 1; c <= 100; c++) add(`Yes! That's ${centsSay(c)}!`);
['How much money is this?', "Let's count it together!", 'Start with the biggest coin, then count on!'].forEach(t => add(t));
// gems & results
for (let n = 0; n <= 150; n++){ add(`You earned ${n} gems!`); add(`That's ${n} gems!`); }
for (let n = 1; n <= 200; n++) add(`You need ${n} more ${n === 1 ? 'gem' : 'gems'}. Play a game to earn more!`);
['You did it, Ian!', 'Three stars! Amazing!', 'Great job!'].forEach(t => add(t));
WORDS.forEach((_, f) => add(`And you unlocked ${LEVEL_NAMES[f]} on the Word Race!`));
[[MATH_STAGES, 'Star Math'], [COUNT_STAGES, 'Count to 100'], [SHAPE_STAGES, 'Shapes'], [CLOCK_STAGES, 'Clocks'], [COIN_STAGES, 'Coins']].forEach(([st, lab]) =>
  st.forEach((x, k) => k && add(`And you unlocked ${lab} level ${k + 1}: ${x.name}!`)));
// chest prizes
const nm = { blue:'blue gem', gold:'gold gem' };
[['blue'], ['blue','blue'], ['gold'], ['blue','blue','blue'], ['gold','blue'], ['blue','gold'], ['gold','gold']].forEach(g => {
  const cnt = {}; g.forEach(k => cnt[k] = (cnt[k] || 0) + 1);
  const parts = Object.entries(cnt).map(([k, n]) => `${n === 1 ? 'a' : n} ${nm[k]}${n > 1 ? 's' : ''}`);
  add(`You found ${parts.join(' and ')}!`); });
['Ooh! A treasure chest! Tap it three times to open it!', "It's yours to keep!", 'It looks amazing!', 'Drag it where you want it!', 'You can only find it in a treasure chest!'].forEach(t => add(t));
ITEMS.forEach(it => { add(`Ooh, ${it.name}!`); add(`You got ${it.name}!`); add(`You found ${it.name}!`); if (it.chest) add(`${it.name} is a secret treasure!`); });
CAR_PARTS.forEach(it => { add(`Ooh, ${it.name}!`); add(`You got ${it.name}!`); add(`You found ${it.name}!`); if (it.chest) add(`${it.name} is a secret treasure!`); });
['Welcome to your garage! Make your race car awesome!', 'Ready, set, go! Vroom vroom!', 'Vroom vroom!'].forEach(t => add(t));
['Welcome to the Pet Vet! Who needs help today?', 'Hmm, try a different tool!'].forEach(t => add(t));
VET_TOOLS.forEach(([k]) => add(`Answer this to use the ${k}!`));
PETS.forEach(p => { add(`${p.name} doesn't feel well! Tap a tool to help!`); add(`What else does ${p.name} need?`); add(`${p.name} is all better! Great job, Doctor Ian!`); });
Object.values(VET_PROBLEMS).forEach(v => add(v.fixed));
[...FURN, ...WALLS, ...FLOORS].forEach(x => { add(`Ooh, ${x.name}!`); add(`You got the ${x.name}!`); });
// pets
PETS.forEach(p => { add(`To get this pet: ${p.goal}!`); add(`${p.name} is following you now!`); add(`${p.name} wants to follow you everywhere!`); });
for (let n = 2; n <= PETS.length; n++) add(`You earned ${n} new pet friends!`);
['Wow!', 'You earned a new pet friend!', 'Go to Pet Friends to see them!', 'Here are your pet friends!', 'Reach a goal to earn a pet friend! Here are the goals.'].forEach(t => add(t));
// story
CHAPTERS.forEach((c, k) => {
  add(`One of your race buddies is lost in the ${c.name}! What is his name?`);
  const names = ['your friend', ...BAND_FRIENDS, ...(c.names || [])];
  c.levels.forEach(l => names.forEach(n => add(l.replace('your friend', n))));
  names.forEach(n => { add(`Let's go rescue ${n}!`); add(`${n} is trapped in a ${c.cageName}! Answer to break it!`); add(`${n} is locked in the ${c.cageName}! Answer to open the locks!`); add(n); });
});
["Thank you Ian! You saved me! I'm back on the crew! Now it's time for the big race! More adventures are coming soon!",
 "Oh no! A grumpy cloud named Grumble blew your race crew away, right before the big race! Let's go find your friends!",
 "The race was amazing! And Grumble loved the race so much, he isn't grumpy anymore! You are a champion, Ian!",
 'That world is coming soon!', 'Finish the world before it first!', 'Finish the level before it first!'].forEach(t => add(t));
// home & menus
['Hi Ian! Where do you want to play?', 'Hi Ian! You look awesome! Where do you want to play?', 'Hi Ian! Do you like this voice?',
 'Welcome to the Number Garage! Pick a game!', 'Welcome to the style shop! Pick something to wear!', 'Decorate your room! Buy new things and drag them around!',
 'This is my room!', 'That one is coming soon!'].forEach(t => add(t));
return [...L.values()];
})()