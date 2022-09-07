import clsx from "clsx";
import React from "react";
import styles from "./styles.module.css";

const FeatureList = [
    {
        title: "Fern let us expand our backend libraries way faster than manually building them",
        fullName: "Andrew Israel",
        job: "Founder of PropelAuth",
        profileImg: require("@site/static/img/andrew.jpeg").default,
    },
];

function Feature({ title, fullName, job, profileImg }) {
    return (
        <div className={clsx("col col--4")} style={{ paddingBottom: 2 + "rem" }}>
            <div className={styles.block}>
                <h3>“{title}“</h3>
                <div className={styles.profileBlock}>
                    <img src={profileImg} className={styles.profileImg}></img>
                    <div className={styles.description}>
                        <strong>{fullName}</strong>
                        <p style={{ opacity: 0.75 }}>{job}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function HomepageFeatures() {
    return (
        <>
            <h1 style={{ textAlign: "center", paddingTop: 3 + "rem", fontSize: 2.25 + "rem" }}>Testimonials</h1>
            <section className={styles.features}>
                <div className="container">
                    <div className="row" style={{ justifyContent: "center" }}>
                        {FeatureList.map((props, idx) => (
                            <Feature key={idx} {...props} />
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
