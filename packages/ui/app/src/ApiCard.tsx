import { Classes, Intent, Tag } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import styles from "./ApiCard.module.scss";
import { ClientsPublishStatus } from "./ClientsPublishStatus";
import { FavoriteButton } from "./FavoriteButton";
import { GithubRepoLink } from "./GithubRepoLink";

export const ApiCard: React.FC = () => {
    return (
        <div className={styles.card}>
            <div className={styles.titleSection}>
                <div className={styles.titleLeftSection}>
                    <a className={styles.title}>fiddle-coordinator</a>
                    <FavoriteButton isFavorited={Math.random() > 0.5} />
                </div>
                <div className={styles.titleRightSection}>
                    <Tag intent={Intent.SUCCESS} icon={IconNames.PULSE} large minimal>
                        Live
                    </Tag>
                    <GithubRepoLink iconOnly />
                </div>
            </div>
            <div className={styles.content}>
                <div className={classNames(styles.subtitle, Classes.TEXT_MUTED)}>
                    {`Here is some information about this service. ${
                        Math.random() > 0.5 ? "askldj lkadja lkdjalskdj aklsdj slkdj aklsdjaskld jklasdj" : ""
                    } Here is some information
                    about this service.`}
                </div>
                <ClientsPublishStatus />
            </div>
        </div>
    );
};
