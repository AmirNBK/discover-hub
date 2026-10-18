import Link from "next/link";
import { ArrowUpRight, Compass } from "lucide-react";
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <Link href="/" className="brand">
              <span className="brand-mark">
                <Compass size={24} />
              </span>
              <span>
                discover<span className="brand-light">hub</span>.
              </span>
            </Link>
            <p>
              A little curiosity goes a long way.
              <br />
              Find somewhere that feels like you.
            </p>
          </div>
          <div>
            <span className="eyebrow">GO EXPLORE</span>
            <Link href="/#destinations">Destinations</Link>
            <Link href="/map">Explore the map</Link>
            <Link href="/saved">Your saved places</Link>
          </div>
          <div>
            <span className="eyebrow">GET TO KNOW US</span>
            <Link href="/about-us">Our story</Link>
            <Link href="/contact-us">Get in touch</Link>
            <Link href="/privacy">Privacy & your data</Link>
            <Link href="/photo-credits">Photo credits</Link>
          </div>
          <div className="footer-note">
            <span className="eyebrow">YOUR NEXT CHAPTER</span>
            <p>It starts with a place.</p>
            <Link href="/map" className="text-link">
              Find yours <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} DiscoverHub. Made for the curious.
          </span>
          <span>
            Less scrolling. More exploring. <Compass size={14} />
          </span>
        </div>
      </div>
    </footer>
  );
}
