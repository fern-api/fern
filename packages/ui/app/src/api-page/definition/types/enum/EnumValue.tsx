import { FernRegistry } from "@fern-fern/registry";
import classNames from "classnames";
import { MonospaceText } from "../../../../commons/MonospaceText";
import { Markdown } from "../../markdown/Markdown";
import { useTypeDefinitionContext } from "../context/TypeDefinitionContext";

export declare namespace EnumValue {
    export interface Props {
        enumValue: FernRegistry.EnumValue;
    }
}

export const EnumValue: React.FC<EnumValue.Props> = ({ enumValue }) => {
    const { isRootTypeDefinition } = useTypeDefinitionContext();

    return (
        <div
            className={classNames("flex flex-col py-4", {
                "px-2": !isRootTypeDefinition,
            })}
        >
            <MonospaceText>{`"${enumValue.value}"`}</MonospaceText>
            {enumValue.description != null && (
                <div className={classNames("mt-3", "text-gray-500", "dark:text-gray-400")}>
                    <Markdown>{enumValue.description}</Markdown>
                </div>
            )}
        </div>
    );
};
