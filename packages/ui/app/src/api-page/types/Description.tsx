import classNames from "classnames";

export declare namespace Description {
    export interface Props {
        htmlDescription: string | undefined;
        className?: string;
    }
}

export const Description: React.FC<Description.Props> = ({ htmlDescription, className }) => {
    if (htmlDescription == null) {
        return null;
    }

    return (
        <div
            className={classNames("prose-p:text-[#A7A7B0] mt-3", className)}
            dangerouslySetInnerHTML={{ __html: htmlDescription }}
        />
    );
};
