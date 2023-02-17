import classNames from "classnames";
import { FernLogo } from "../FernLogo";
import styles from "./Header.module.scss";

export const Header: React.FC = () => {
    return (
        <div className={styles.container}>
            <div className={styles.item}>
                <div className={styles.logoWrapper}>
                    <div className={styles.logo}>
                        <FernLogo size={30} />
                    </div>
                </div>
            </div>
            <div className={classNames(styles.item, styles.center)}>
                <div className={styles.apiName}>Authentication Service</div>
            </div>
            <div className={styles.item} />
        </div>
    );
};
