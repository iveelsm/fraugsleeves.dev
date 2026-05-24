const isDesktop = window.matchMedia("(min-width: 640px)").matches;

document
	.querySelectorAll<HTMLTemplateElement>("template[data-desktop-only]")
	.forEach((t) => {
		if (isDesktop) {
			t.replaceWith(t.content.cloneNode(true));
		} else {
			t.remove();
		}
	});

document
	.querySelectorAll<HTMLTemplateElement>("template[data-mobile-only]")
	.forEach((t) => {
		if (!isDesktop) {
			t.replaceWith(t.content.cloneNode(true));
		} else {
			t.remove();
		}
	});
