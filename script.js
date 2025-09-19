let selections = {
  animal: null,
  object: null,
  clothes: null
};

// Handle card clicks
document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {
    const category = card.dataset.category;
    const value = card.dataset.value;

    // Remove previous selection in same category
    document.querySelectorAll(`.card[data-category="${category}"]`)
      .forEach(c => c.classList.remove("selected"));

    card.classList.add("selected");
    selections[category] = value;

    // If all selected, show combo
    if (selections.animal && selections.object && selections.clothes) {
      showCombo();
    }
  });
});

// Generate combo image using Stability AI
async function showCombo() {
  const prompt = `A ${selections.animal} with a ${selections.object} wearing a ${selections.clothes}, cartoon style for kids`;

  const comboImage = document.getElementById("comboImage");
  const message = document.getElementById("comboMessage");

  message.innerText = "✨ Generating your BrainBoom image... please wait!";
  comboImage.style.display = "none";

  try {
    const response = await fetch("https://api.stability.ai/v2beta/stable-image/generate/core", {
      method: "POST",
      headers: {
        "Authorization": `Bearer sk-RVLlTlmjJUsITgTukbfGJSLhiPahV5HbqU1ok9HXKgSuRAD0`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: prompt,
        output_format: "png"
      })
    });

    if (!response.ok) {
      throw new Error("Failed to generate image");
    }

    const data = await response.json();
    const imageBase64 = data.image; // base64 string
    comboImage.src = "data:image/png;base64," + imageBase64;

    comboImage.style.display = "block";
    message.innerText = "";
  } catch (error) {
    console.error(error);
    message.innerText = "⚠️ Oops! Image generation failed. Try again!";
  }
}
