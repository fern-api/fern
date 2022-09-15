import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import React from "react";
import styles from "./index.module.css";

function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <div className={styles.heroBanner}>
            <div className="container" style={{ textAlign: "left" }}>
                <h1 className={styles.hero_title}>{siteConfig.tagline}</h1>
                <p className="hero__subtitle" style={{ color: "black" }}>
                    Keeps your docs and SDKs in sync with your API.
                </p>
                <div className={styles.buttons}>
                    <button
                        className={styles.hero_button}
                        onClick={() => {
                            location.href = "/docs/intro";
                        }}
                    >
                        Get Started
                    </button>
                    <button
                        className={styles.hero_button_git}
                        onClick={() => {
                            window.open("https://github.com/fern-api/fern/", "_blank");
                        }}
                    >
                        View GitHub
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Home() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout title={siteConfig.title}>
            <HomepageHeader />
            <div className={styles.legalFooter}>
                <a target="_blank" rel="noopener noreferrer" href="/docs/legal/privacy">
                    Privacy Policy
                </a>
                <a target="_blank" rel="noopener noreferrer" href="/docs/legal/cookie">
                    Cookie Policy
                </a>
                <a target="_blank" rel="noopener noreferrer" href="/docs/legal/terms">
                    Terms of Service
                </a>
            </div>
        </Layout>
    );
}
