import styles from "./HoverableText.module.scss";

export declare namespace HoverableText {
    export interface Props {
        text: string;
    }
}

export const HoverableText: React.FC<HoverableText.Props> = ({ text }) => {
    return <span className={styles.hoverable}>{text}</span>;
};
