import classNames from "classnames";
import React from "react";

export declare namespace TypeString {
    export interface Props {
        className?: string;
        article?: string;
        children: string;
    }
}

export const TypeString: React.FC<TypeString.Props> = ({ className, article, children }) => {
    return (
        <div className={classNames("flex", className)}>
            {article != null && <span className="mr-1">{article}</span>}
            {children}
        </div>
    );
};
