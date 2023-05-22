export declare namespace SeparatedElements {
    export interface Props {
        separator: JSX.Element;
        children: JSX.Element[];
    }
}

export const SeparatedElements: React.FC<SeparatedElements.Props> = ({ separator, children }) => {
    if (children.length === 0) {
        return null;
    }

    return children.reduce((acc, child) => (
        <>
            {acc}
            {separator}
            {child}
        </>
    ));
};
