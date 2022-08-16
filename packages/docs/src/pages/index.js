import React from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";

import styles from "./index.module.css";

function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <header className={styles.heroBanner}>
            <div className="container" style={{ textAlign: "left" }}>
                <h1 className={styles.hero_title}>Define your API once. Keep your server, SDKs, and docs in sync.</h1>
                <p className="hero__subtitle" style={{ color: "black" }}>
                    Fern is the single source of truth for your API that ensures type safety between your server,
                    clients, and documentation.
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
                            window.open("https://github.com/fern-api/fern/");
                        }}
                    >
                        View GitHub
                    </button>
                </div>
            </div>
        </header>
    );
}

export default function Home() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout title={siteConfig.title}>
            <HomepageHeader />
            <main>
                <HomepageFeatures />
            </main>
        </Layout>
    );
}
