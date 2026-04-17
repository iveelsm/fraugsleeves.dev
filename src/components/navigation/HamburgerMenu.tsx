import { useEffect } from "react";

export default function HamburgerMenu() {
	useEffect(() => {
		const hamburgerBtn = document.getElementById("hamburger-btn");
		const mobileNavOverlay = document.getElementById("mobile-nav-overlay");

		if (!hamburgerBtn || !mobileNavOverlay) {
			return;
		}

		function closeMenu() {
			mobileNavOverlay!.classList.remove("active");
			hamburgerBtn!.classList.remove("active");
			hamburgerBtn!.setAttribute("aria-expanded", "false");
			document.body.style.overflow = "";
		}

		function toggleMenu() {
			const isOpen = mobileNavOverlay!.classList.contains("active");
			if (isOpen) {
				closeMenu();
			} else {
				mobileNavOverlay!.classList.add("active");
				hamburgerBtn!.classList.add("active");
				hamburgerBtn!.setAttribute("aria-expanded", "true");
				document.body.style.overflow = "hidden";
			}
		}

		function handleLinkClick() {
			closeMenu();
		}

		function handleEscape(e: KeyboardEvent) {
			if (
				e.key === "Escape" &&
				mobileNavOverlay!.classList.contains("active")
			) {
				closeMenu();
			}
		}

		hamburgerBtn.addEventListener("click", toggleMenu);

		const mobileNavLinks =
			mobileNavOverlay.querySelectorAll(".mobile-nav-link");
		mobileNavLinks.forEach((link) => {
			link.addEventListener("click", handleLinkClick);
		});

		document.addEventListener("keydown", handleEscape);

		hamburgerBtn.setAttribute("data-hydrated", "");

		return () => {
			hamburgerBtn.removeEventListener("click", toggleMenu);
			mobileNavLinks.forEach((link) => {
				link.removeEventListener("click", handleLinkClick);
			});
			document.removeEventListener("keydown", handleEscape);
		};
	}, []);

	return null;
}
