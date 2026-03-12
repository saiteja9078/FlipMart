import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="main-footer">
      <div className="footer__inner container">
        <div className="footer__cols">
          <div className="footer__col">
            <h4 className="footer__heading">ABOUT</h4>
            <ul>
              <li>Contact Us</li>
              <li>About Us</li>
              <li>Careers</li>
              <li>FlipMart Stories</li>
              <li>Press</li>
            </ul>
          </div>
          <div className="footer__col">
            <h4 className="footer__heading">HELP</h4>
            <ul>
              <li>Payments</li>
              <li>Shipping</li>
              <li>Cancellation & Returns</li>
              <li>FAQ</li>
            </ul>
          </div>
          <div className="footer__col">
            <h4 className="footer__heading">POLICY</h4>
            <ul>
              <li>Return Policy</li>
              <li>Terms Of Use</li>
              <li>Security</li>
              <li>Privacy</li>
            </ul>
          </div>
          <div className="footer__col">
            <h4 className="footer__heading">SOCIAL</h4>
            <ul>
              <li>Facebook</li>
              <li>Twitter</li>
              <li>YouTube</li>
              <li>Instagram</li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; 2026 FlipMart. Built as an SDE Intern Assignment.</p>
        </div>
      </div>
    </footer>
  );
}
