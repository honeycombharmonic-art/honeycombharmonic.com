document.documentElement.classList.add("js");

const toggle = document.querySelector(".nav-toggle");
const navigation = document.querySelector("#site-nav");

if (toggle && navigation) {
  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    navigation.dataset.open = String(open);
  };

  setOpen(false);

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      toggle.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) setOpen(false);
  });
}
