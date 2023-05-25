import classNames from "classnames";
import React from "react";
import styles from "./ExampleWrapper.module.scss";

export declare namespace ExampleWrapper {
    export interface Props {
        className?: string;
        children: (args: { style: React.CSSProperties }) => JSX.Element;
    }
}

const BACKGROUND_COLOR = "rgba(150, 156, 238, 0.1)";

export const ExampleWrapper: React.FC<ExampleWrapper.Props> = ({ className, children }) => {
    return (
        <div className={classNames(styles.code, className, "flex-1 leading-relaxed flex-1 overflow-auto text-xs")}>
            {children({
                style: {
                    backgroundColor: BACKGROUND_COLOR,
                },
            })}
        </div>
    );
};
