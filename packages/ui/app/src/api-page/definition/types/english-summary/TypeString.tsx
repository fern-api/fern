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
        <span className={className}>
            {article != null && `${article} `}
            {children}
        </span>
    );
};
