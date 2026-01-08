const menuBtn = document.querySelector(".mobile-menu-btn");
      const navLinks = document.querySelector(".nav-links");
      menuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("mobile-menu-active");
        menuBtn.textContent = navLinks.classList.contains("mobile-menu-active")
          ? "✕"
          : "☰";
      });