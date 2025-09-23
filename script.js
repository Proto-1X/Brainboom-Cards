// front-end selection state
const selections = { bodyparts: null, animals: null, clothes: null };

// initial task instructions
const instructions = [
  "Write a simple sentence using one of the words.",
  "Make a sentence with an adjective.",
  "Create a sentence with a preposition.",
  "Write a sentence using two words from the cards.",
  "Make a question with one of the words."
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
  if (selections.bodyparts && selections.animals && selections.clothes) {
    showCombo();
  }
}

function clearSelections() {
  document.querySelectorAll('.card.selected').forEach(c => c.classList.remove('selected'));
  selections.bodyparts = selections.animals = selections.clothes = null;
  document.getElementById('comboImage').style.display = 'none';
  document.getElementById('comboMessage').innerText = 'Select one card from each category to generate an image.';
}

// random instruction
function newInstruction() {
  const i = Math.floor(Math.random() * instructions.length);
  document.getElementById('instruction').innerText = instructions[i];
}

// --- IMAGE GENERATION (call backend) ---
// Replace with your Vercel deployment URL (no trailing slash), e.g. "https://brainboom-api.vercel.app"
const VERCEL_BACKEND_URL = "https://brainboom-cards.vercel.app/";

async function showCombo() {
  const prompt = `A friendly, colorful, child-friendly illustration of a ${selections.animals} with a ${selections.bodyparts} wearing a ${selections.clothes}. Clean background, bright colors, cartoon style, suitable for primary school children.`;

  const comboImage = document.getElementById('comboImage');
  const comboMessage = document.getElementById('comboMessage');

  comboMessage.innerText = "✨ Generating your BrainBoom image... please wait!";
  comboImage.style.display = 'none';

  try {
    const resp = await fetch(`https://brainboom-cards.vercel.app/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!resp.ok) {
      const err = await resp.text();
      console.error('Backend error:', err);
      comboMessage.innerText = "⚠️ Oops! The Brain Kitchen is busy. Try again in a bit.";
      return;
    }

    const data = await resp.json();

    if (data.error) {
      console.error('API returned error', data);
      comboMessage.innerText = "⚠️ Oops! The Brain Kitchen couldn't cook that one.";
      return;
    }

    // Stability returns base64(s) inside response. We expect data.artifacts[0].base64 or similar.
    // Backend will normalize and return { imageBase64: "..." }
    const base64 = data.imageBase64 || data.base64 || (data.artifacts && data.artifacts[0] && data.artifacts[0].base64);

    if (!base64) {
      console.error('No base64 in response', data);
      comboMessage.innerText = "⚠️ No image was returned. Try again.";
      return;
    }

    comboImage.src = "data:image/png;base64," + base64;
    comboImage.style.display = 'block';
    comboMessage.innerText = "";
  } catch (e) {
    console.error('Fetch error', e);
    comboMessage.innerText = "⚠️ Network hiccup — try again.";
  }
}

// expose helper to global scope for inline onclick handlers
window.selectCard = selectCard;
window.newInstruction = newInstruction;
window.clearSelections = clearSelections;
