import { FernLogo } from "../FernLogo";
import styles from "./Header.module.scss";

export const Header: React.FC = () => {
    return (
        <div className={styles.container}>
            <div className={styles.logo}>
                <FernLogo size={30} />
            </div>
            <div className={styles.apiName}>Authentication Service</div>
        </div>
    );
};
