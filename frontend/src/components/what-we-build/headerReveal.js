import { gsap, SplitText } from '../../lib/motion/gsap';

/**
 * The heading rises line by line out of a mask while the eyebrow and intro
 * fade up, all before the deck arrives. SplitText keeps its default
 * aria: 'auto', so assistive tech reads the original sentence, not fragments;
 * autoSplit re-splits once the display font loads or the width changes.
 *
 * On desktop the header lives inside the pinned stage, so the section itself
 * is the trigger; in the mobile list the header reveals as it enters.
 *
 * @returns {() => void} cleanup
 */
export function revealHeader({ section, header, eyebrow, title, intro }, { desktop }) {
  const trigger = () =>
    desktop ? { trigger: section, start: 'top 70%', once: true } : { trigger: header, start: 'top 85%', once: true };

  const split = title
    ? SplitText.create(title, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            duration: 1.1,
            ease: 'lumi.out',
            stagger: 0.12,
            scrollTrigger: trigger(),
          }),
      })
    : null;

  const companions = [eyebrow, intro].filter(Boolean);
  if (companions.length) {
    gsap.fromTo(
      companions,
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.9, ease: 'lumi.out', stagger: 0.2, scrollTrigger: trigger() }
    );
  }

  return () => split?.revert();
}
