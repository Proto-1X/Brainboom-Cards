// front-end selection state
const selections = { animal: null, bodyparts: null, clothes: null };

// initial task instructions
const instructions = [
  "Write a simple sentence using one of the words.",
  "Make a sentence with an adjective.",
  "Create a sentence with a preposition.",
  "Write a sentence using two words from the cards.",
  "Make a question with one of the words."
];

// fun catchphrases for loading
const loadingMessages = [
  "🧠 Stirring up ideas in the Brain Kitchen...",
  "🎨 Mixing colors and creativity...",
  "✨ Cooking up your masterpiece...",
  "⚡ Charging imagination batteries...",
  "🪄 Conjuring your magical combo...",
  "🚀 Launching creativity rocket...",
  "🎉 Almost there... your picture is being born!"
];

// playful error messages
const errorMessages = [
  "😵 Oops, the Brain Machine sneezed. Try again!",
  "🐢 The creativity turtle is too slow today. Retry?",
  "🛠️ Our imagination gears got stuck. Give it another go!",
  "🌧️ Rain in the idea factory... wait and try again!",
  "🔥 Too much brain power at once! Please retry."
];

// Helper: when card clicked
function selectCard(el) {
  const categoryEl = el.closest('.category');
  const category = categoryEl.dataset.category;
  const value = el.dataset.value;

  // remove selected class from other cards in same category
  categoryEl.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));

  // mark this selected
  el.classList.add('selected');
  selections[category] = value;

  // once we have all three selections, generate image
  if (selections.animal && selections.bodyparts && selections.clothes) {
    showCombo();
  }
}

function clearSelections() {
  document.querySelectorAll('.card.selected').forEach(c => c.classList.remove('selected'));
  selections.animal = selections.bodyparts = selections.clothes = null;
  document.getElementById('comboImage').style.display = 'none';
  document.getElementById('comboMessage').innerText = 'Select one card from each category to generate an image.';
}

// random instruction
function newInstruction() {
  const i = Math.floor(Math.random() * instructions.length);
  document.getElementById('instruction').innerText = instructions[i];
}

// --- IMAGE GENERATION (call backend) ---
const VERCEL_BACKEND_URL = "https://brainboom-cards.vercel.app";

async function showCombo() {
  // add random number 1–5 only for bodyparts
  const randomNum = Math.floor(Math.random() * 5) + 1;
  const bodypartWithNum = `${randomNum} ${selections.bodyparts}`;

  const prompt = `A friendly, colorful, weird combo illustration of a ${selections.animal} with ${bodypartWithNum} wearing a ${selections.clothes}. Clean background, bright colors, cartoon style, suitable for primary school children.`;

  const comboImage = document.getElementById('comboImage');
  const comboMessage = document.getElementById('comboMessage');

  // fun loading message
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

// expose helper to global scope for inline onclick handlers
window.selectCard = selectCard;
window.newInstruction = newInstruction;
window.clearSelections = clearSelections;
