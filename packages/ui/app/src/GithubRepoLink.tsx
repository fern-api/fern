import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { useIsHovering } from "@fern-ui/react-commons";
import GitHubIcon from "@mui/icons-material/GitHub";
import classNames from "classnames";
import { useCallback } from "react";
import styles from "./GithubRepoLink.module.scss";

export declare namespace GithubRepoLink {
    export interface Props {
        iconOnly?: boolean;
    }
}

export const GithubRepoLink: React.FC<GithubRepoLink.Props> = ({ iconOnly = false }) => {
    const onClick = useCallback(() => {
        window.open("https://www.github.com", "_blank", "noreferrer,noopener");
    }, []);

    const { isHovering, onMouseLeave, onMouseEnter } = useIsHovering();

    return (
        <div className={styles.container} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            <GitHubIcon />
            {iconOnly || (
                <>
                    <span
                        className={classNames(styles.repoName, {
                            [styles.underlined ?? "_"]: isHovering,
                        })}
                    >
                        fern-api/fiddle
                    </span>
                    {isHovering && <Icon className={styles.linkArrow} icon={IconNames.ARROW_TOP_RIGHT} />}
                </>
            )}
        </div>
    );
};
