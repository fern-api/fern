export declare namespace SeparatedElements {
    export interface Props {
        separator: JSX.Element;
        children: (JSX.Element | null)[];
    }
}

export const SeparatedElements: React.FC<SeparatedElements.Props> = ({ separator, children }) => {
    return children.reduce((acc, child) => {
        if (acc == null) {
            return child;
        }
        if (child == null) {
            return acc;
        }
        return (
            <>
                {acc}
                {separator}
                {child}
            </>
        );
    }, null);
};
