import { NonIdealState, Pre } from "@blueprintjs/core";
import styles from "./MissingRoute.module.scss";

export declare namespace MissingRoute {
    export interface Props {
        header: JSX.Element | undefined;
    }
}

export const MissingRoute: React.FC<MissingRoute.Props> = ({ header }) => {
    return (
        <div className={styles.container}>
            {header}
            <NonIdealState
                title={
                    <Pre>
                        <a
                            className={styles.title}
                            href="https://en.wikipedia.org/wiki/HTTP_404"
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            404 NOT FOUND
                        </a>
                    </Pre>
                }
            />
        </div>
    );
};
