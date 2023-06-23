export declare namespace Card {
    export interface Props {
        title: string;
        text?: string;
        href?: string;
    }
}

export const Card: React.FC<Card.Props> = ({ title, text, href }) => {
    const Component = href != null ? "a" : "div";
    return (
        <Component
            className="border-border hover:border-accentPrimary flex w-[300px] rounded border bg-white/5 p-5 !no-underline transition hover:border-solid"
            href={href}
        >
            <div className="font-medium !text-white">{title}</div>
            {text != null && <div>{text}</div>}
        </Component>
    );
};
