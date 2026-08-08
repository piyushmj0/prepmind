import { useNavigate } from "react-router-dom";
import styles from "../style/landing.module.scss";

export const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.landingContainer}>
      <header className={styles.header}>
        <div className={styles.logo}>PrepMind</div>
        <nav className={styles.nav}>
          <button className={styles.loginBtn} onClick={() => navigate("/login")}>
            Login
          </button>
          <button className={styles.registerBtn} onClick={() => navigate("/register")}>
            Sign Up
          </button>
        </nav>
      </header>

      <main className={styles.hero}>
        <h1>
          Acing your next interview <br />
          <span>just got easier.</span>
        </h1>
        <p>
          AI-powered interview preparation tailored to your unique resume and target job description. 
          Get instant feedback, match scores, and a personalized multi-day preparation plan.
        </p>
        <button className={styles.ctaBtn} onClick={() => navigate("/register")}>
          Start Preparing Now
        </button>
      </main>

      <section className={styles.features}>
        <div className={styles.card}>
          <div className={styles.icon}>📄</div>
          <h3>Resume Analysis</h3>
          <p>We analyze your resume against your target job to give you a comprehensive match score and identify skill gaps.</p>
        </div>
        <div className={styles.card}>
          <div className={styles.icon}>🤖</div>
          <h3>AI Question Bank</h3>
          <p>Get custom technical and behavioral questions specifically generated for the role you're applying for.</p>
        </div>
        <div className={styles.card}>
          <div className={styles.icon}>📅</div>
          <h3>Custom Prep Plan</h3>
          <p>Receive a structured, multi-day study plan to focus your efforts exactly where you need them most.</p>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} PrepMind. All rights reserved.</p>
      </footer>
    </div>
  );
};
