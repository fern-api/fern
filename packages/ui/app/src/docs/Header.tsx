import classNames from "classnames";

export const Header: React.FC = () => {
    return (
        <div
            className={classNames(
                "flex justify-end items-center gap-10 px-24 shrink-0",
                // this matches with the calc() in the EndpointContent examples section
                "h-16"
            )}
        >
            <div className="rounded-full bg-[#5652dc] py-2 px-4">Schedule demo</div>
        </div>
    );
};
