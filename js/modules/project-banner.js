export function initProjectBanner() {
  const banner = document.getElementById("projectBanner");
  const acceptBtn = document.getElementById("projectBannerAccept");

  if (!banner || !acceptBtn) return;

  const accepted = localStorage.getItem("project-banner-accepted");

  if (!accepted) {
    banner.hidden = false;
    banner.setAttribute("aria-hidden", "false");
  }

  acceptBtn.addEventListener("click", () => {
    localStorage.setItem("project-banner-accepted", "true");
    banner.hidden = true;
    banner.setAttribute("aria-hidden", "true");
  });
}
