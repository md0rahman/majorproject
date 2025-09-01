// public/js/wishlist.js

function toggleUi(icon, wished) {
  if (wished) {
    icon.classList.remove("fa-regular");
    icon.classList.add("fa-solid");
    icon.style.color = "red";
  } else {
    icon.classList.add("fa-regular");
    icon.classList.remove("fa-solid");
    icon.style.color = "white";
  }
}

async function callToggle(id) {
  const res = await fetch(`/api/wishlist/toggle/${id}`, {
    method: "POST",
    headers: { "X-Requested-With": "XMLHttpRequest" },
    credentials: "same-origin",
  });
  if (!res.ok || res.redirected) throw new Error("request failed");
  return res.json(); // { ok, wished }
}

// 🔁 auto-run when we return after login
(async function autoWishAfterLogin() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("autowish");
  const loggedIn = document.body.dataset.loggedin === "true";

  if (id && loggedIn) {
    try {
      const data = await callToggle(id);
      if (data.ok) {
        // update all matching hearts on this page (index or show)
        document.querySelectorAll(`.heartIcon[data-id="${id}"]`)
          .forEach((icon) => toggleUi(icon, data.wished));
      }
    } catch {}
    // clean the URL (remove ?autowish=...)
    window.history.replaceState({}, "", window.location.pathname);
  }
})();

// ❤️ click handler
document.addEventListener("click", async (e) => {
  const icon = e.target.closest(".heartIcon");
  if (!icon) return;
  e.preventDefault();
  e.stopPropagation();

  const id = icon.dataset.id;
  if (!id) return;

  const loggedIn = document.body.dataset.loggedin === "true";
  if (!loggedIn) {
    // go to login and remember where we were + what we clicked
    const returnTo = window.location.pathname + window.location.search + window.location.hash;
    window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}&wish=${encodeURIComponent(id)}`;
    return;
  }

  try {
    const data = await callToggle(id);
    if (data.ok) toggleUi(icon, data.wished);
  } catch {
    // if session expired mid-use, send to login
    window.location.href = "/login";
  }
}, true);
