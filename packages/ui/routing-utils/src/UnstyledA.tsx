import classNames from "classnames";
import styles from "./UnstyledLink.module.scss";

export declare namespace UnstyledA {
    export interface Props extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
        showUnderline?: boolean;
        muted?: boolean;
    }
}

export const UnstyledA: React.FC<UnstyledA.Props> = ({
    className,
    showUnderline = false,
    muted = false,
    ...linkProps
}) => {
    return (
        <a
            className={classNames(styles.link, className, {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                [styles.showUnderline!]: showUnderline,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                [styles.muted!]: muted,
            })}
            {...linkProps}
        />
    );
};
