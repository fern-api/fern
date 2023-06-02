import classNames from "classnames";

export declare namespace TypeComponentSeparator {
    export interface Props {
        className?: string;
    }
}

export const TypeComponentSeparator: React.FC<TypeComponentSeparator.Props> = ({ className }) => {
    return <div className={classNames(className, "h-px bg-border")} />;
};
