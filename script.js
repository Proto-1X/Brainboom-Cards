let selections = {
  animal: null,
  object: null,
  clothes: null
};

function selectCard(card, name) {
  const category = card.closest(".category").dataset.category;

  // Reset old selection in this category
  const cards = card.closest(".category").querySelectorAll(".card");
  cards.forEach(c => c.classList.remove("selected"));

  // Set new selection
  card.classList.add("selected");
  selections[category] = name;

  // Check if all categories are chosen
  if (selections.animal && selections.object && selections.clothes) {
    showCombo();
  }
}

function showCombo() {
  const comboName = `${selections.animal}_${selections.object}_${selections.clothes}`;
  const comboPath = `combos/${comboName}.jpg`;

  const comboImage = document.getElementById("comboImage");
  const message = document.getElementById("comboMessage");

  comboImage.src = comboPath;

  comboImage.onerror = function () {
    comboImage.style.display = "none";
    const funPhrases = [
      "Oops! That combo is still cooking in the Brain Kitchen 🍳🧠",
      "Hmm… looks like that combo is hiding! 🔍",
      "That mix is too silly even for us 😂",
      "Try another combo — this one flew away 🐦"
    ];
    const randomPhrase = funPhrases[Math.floor(Math.random() * funPhrases.length)];
    message.innerText = randomPhrase;
  };

  comboImage.onload = function () {
    comboImage.style.display = "block";
    message.innerText = "";
  };
}

const instructions = [
  "Write a simple sentence using one of the words.",
  "Make a sentence with an adjective.",
  "Create a sentence with a preposition.",
  "Write a sentence using two words from the cards.",
  "Make a question with one of the words."
];

function newInstruction() {
  const randomIndex = Math.floor(Math.random() * instructions.length);
  document.getElementById("instruction").innerText = instructions[randomIndex];
}
