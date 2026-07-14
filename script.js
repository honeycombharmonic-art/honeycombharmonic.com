const cartText = document.querySelector("#cartText");
const contactForm = document.querySelector("#contact");
const topicSelect = contactForm?.querySelector("select[name='topic']");
const messageBox = contactForm?.querySelector("textarea[name='message']");

document.querySelectorAll(".shop-item").forEach((button) => {
  button.addEventListener("click", () => {
    const product = button.dataset.product;
    const price = button.dataset.price;
    if (cartText) {
      cartText.textContent = `${product} staged at $${price}. Use the contact page to complete this draft order.`;
    }

    if (topicSelect) topicSelect.value = "Balm order";
    if (messageBox && !messageBox.value.trim()) {
      messageBox.value = `I would like to order: ${product}.`;
    }
    if (contactForm) {
      contactForm.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});
