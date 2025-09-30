// --- FRONT-END SELECTION STATE ---
const selections = { animal: null, bodyparts: [], clothes: null };

// --- TASK INSTRUCTIONS WITH EXAMPLES ---
const instructions = [
  {
    task: "Write a sentence.\nStart with: I’ve got… Then write the number and the body part.",
    example: "Example: I’ve got two hands."
  },
  {
    task: "Write a sentence.\nStart with: This is my… (for one item) or These are my… (for more than one item). Then write the colour and the clothing item.",
    example: "Examples:\nThis is my green hat.\nThese are my blue shoes."
  },
  {
    task: "Write a sentence.\nStart with: I can… (for something you can do) or I can’t… (for something you cannot do). Then write the action word.",
    example: "Examples:\nI can run.\nI can’t fly."
  }
];

// --- FUN CATCHPHRASES FOR LOADING ---
const loadingMessages = [
  "🧠 Stirring up ideas in the Brain Kitchen...",
  "🎨 Mixing colors and creativity...",
  "✨ Cooking up your masterpiece...",
  "⚡ Charging imagination batteries...",
  "🪄 Conjuring your magical combo...",
  "🚀 Launching creativity rocket...",
  "🎉 Almost there... your picture is being born!"
];

// --- PLAYFUL ERROR MESSAGES ---
const errorMessages = [
  "😵 Oops, the Brain Machine sneezed. Try again!",
  "🐢 The creativity turtle is too slow today. Retry?",
  "🛠️ Our imagination gears got stuck. Give it another go!",
  "🌧️ Rain in the idea factory... wait and try again!",
  "🔥 Too much brain power at once! Please retry."
];

// --- HELPER: CARD SELECTION ---
function selectCard(el) {
  const categoryEl = el.closest('.category');
  const category = categoryEl.dataset.category;
  const value = el.dataset.value;

  if (category === "bodyparts") {
    // toggle selection ON/OFF for bodyparts
    if (el.classList.contains("selected")) {
      el.classList.remove("selected");
      selections.bodyparts = selections.bodyparts.filter(v => v !== value);
    } else {
      el.classList.add("selected");
      selections.bodyparts.push(value);
    }
  } else {
    // single selection for animal/clothes
    categoryEl.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selections[category] = value;
  }

  // generate image only when all categories are chosen
  if (selections.animal && selections.bodyparts.length > 0 && selections.clothes) {
    showCombo();
  }
}

// --- CLEAR SELECTIONS ---
function clearSelections() {
  document.querySelectorAll('.card.selected').forEach(c => c.classList.remove('selected'));
  selections.animal = null;
  selections.bodyparts = [];
  selections.clothes = null;
  document.getElementById('comboImage').style.display = 'none';
  document.getElementById('comboMessage').innerText = 'Select one card from each category to generate an image.';
}

// --- NEW INSTRUCTION + EXAMPLE ---
function newInstruction() {
  const i = Math.floor(Math.random() * instructions.length);
  document.getElementById('instruction').innerText = instructions[i].task;
  document.getElementById('sentence').placeholder = instructions[i].example;
}

// --- IMAGE GENERATION (CALL BACKEND) ---
const VERCEL_BACKEND_URL = "https://brainboom-cards.vercel.app";

async function showCombo() {
  // random numbers for each bodypart
  const bodypartsWithNums = selections.bodyparts.map(bp => {
    const num = Math.floor(Math.random() * 5) + 1;
    return `${num} ${bp}`;
  }).join(" and ");

  const prompt = `A clear, detailed infographic-style illustration showing a ${selections.animal} with ${bodypartsWithNums}, wearing a ${selections.clothes}. Professional, minimal color palette, clean background, well-labeled and easy to understand. Not cartoonish, but informative and realistic.`;

  const comboImage = document.getElementById('comboImage');
  const comboMessage = document.getElementById('comboMessage');

  // show fun loading message
  comboMessage.innerText = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
  comboImage.style.display = 'none';

  try {
    const resp = await fetch(`${VERCEL_BACKEND_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!resp.ok) {
      const err = await resp.text();
      console.error('Backend error:', err);
      comboMessage.innerText = errorMessages[Math.floor(Math.random() * errorMessages.length)];
      return;
    }

    const data = await resp.json();

    if (data.error) {
      console.error('API returned error', data);
      comboMessage.innerText = errorMessages[Math.floor(Math.random() * errorMessages.length)];
      return;
    }

    const base64 = data.imageBase64 || data.base64 || (data.artifacts && data.artifacts[0] && data.artifacts[0].base64);

    if (!base64) {
      console.error('No base64 in response', data);
      comboMessage.innerText = errorMessages[Math.floor(Math.random() * errorMessages.length)];
      return;
    }

    comboImage.src = "data:image/png;base64," + base64;
    comboImage.style.display = 'block';
    comboMessage.innerText = "";
  } catch (e) {
    console.error('Fetch error', e);
    comboMessage.innerText = errorMessages[Math.floor(Math.random() * errorMessages.length)];
  }
}

// --- EXPOSE HELPERS TO GLOBAL SCOPE ---
window.selectCard = selectCard;
window.newInstruction = newInstruction;
window.clearSelections = clearSelections;
