/**
 * Single registration point for GSAP and every plugin the site uses.
 * Import gsap and its plugins from here (never straight from 'gsap/*') so each
 * plugin is registered exactly once before any component touches it.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { Observer } from 'gsap/Observer';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, Flip, Observer, SplitText, ScrambleTextPlugin, CustomEase);

/** House curves: the site's signature ease-out, and a symmetric in-out. */
CustomEase.create('lumi.out', '0.16,1,0.3,1');
CustomEase.create('lumi.inOut', '0.65,0,0.35,1');

export { gsap, ScrollTrigger, Flip, Observer, SplitText, ScrambleTextPlugin, CustomEase };
export default gsap;
