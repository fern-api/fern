import styles from "./ChangeTypeReferenceTag.module.scss";

export declare namespace ChangeTypeReferenceTag {
    export interface Props {
        label: string;
        onClick: () => void;
    }
}

export const ChangeTypeReferenceTag: React.FC<ChangeTypeReferenceTag.Props> = ({ label, onClick }) => {
    return (
        <div className={styles.container} onClick={onClick}>
            {label}
        </div>
    );
};
