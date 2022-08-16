import React from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Head from "@docusaurus/Head";

import styles from "./index.module.css";

const PricingList = [
    {
        plan: "Free",
        price: "$0",
        description: "Get up and running quickly",
        color: "orange",
        button_description: "Get started",
        button_link: function () {
            return (location.href = "/docs/intro");
        },
    },
    {
        plan: "Team",
        price: "$20 / developer / month",
        description: `White-glove onboarding and a dedicated Slack channel`,
        color: "green",
        button_description: "Subscribe",
        button_link: function () {
            return window.open("https://buy.stripe.com/3csaGP6pE5MgeLm7ss");
        },
    },
    {
        plan: "Enterprise",
        price: "",
        description: "Design a custom package for your business",
        color: "lightblue",
        button_description: "Contact us",
        button_link: function () {
            return window.open("mailto:sales@buildwithfern.com");
        },
    },
];

function PricingBox({ plan, price, description, color, button_description, button_link }) {
    return (
        <div className={styles.pricingList}>
            <div className={styles.pricingBox}>
                <h1 style={{ color: `${color}` }}>{plan}</h1>
                <h3>{price}</h3>
                <p>{description}</p>
                <button className={styles.buy_button} style={{ backgroundColor: `${color}` }} onClick={button_link}>
                    {button_description}
                </button>
            </div>
        </div>
    );
}

export default function PricingPage() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout title={siteConfig.title}>
            <h1 style={{ textAlign: "center", paddingTop: 3 + "rem", fontSize: 2.25 + "rem" }}>
                Choose the plan that's right for you
            </h1>
            <h2 style={{ textAlign: "center" }}>Flexible monthly subscription via Stripe</h2>
            <section className={styles.features}>
                <div className="container">
                    <div className="row" style={{ justifyContent: "center" }}>
                        {PricingList.map((props, idx) => (
                            <PricingBox key={idx} {...props} />
                        ))}
                    </div>
                </div>
            </section>
        </Layout>
    );
}
