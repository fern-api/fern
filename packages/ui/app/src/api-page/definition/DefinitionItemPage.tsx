export declare namespace DefinitionItemPage {
    export type Props = React.PropsWithChildren<{
        title: JSX.Element | string;
        subtitle?: JSX.Element | string;
        docs?: string;
    }>;
}

export const DefinitionItemPage: React.FC<DefinitionItemPage.Props> = ({ title, subtitle, docs, children }) => {
    return (
        <div className="flex-1 flex flex-col px-[10%] min-h-0 overflow-y-auto">
            <div className="pt-10 text-3xl font-bold">{title}</div>
            {subtitle != null && <div className="mt-2">{subtitle}</div>}
            {docs != null && <div className="mt-4 text-gray-600">{docs}</div>}
            <div className="flex mt-8">{children}</div>
        </div>
    );
};
