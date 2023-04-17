import { FernRegistry } from "@fern-fern/registry";
import React from "react";
import { TypeString } from "./TypeString";

export declare namespace PrimitivePreviewPart {
    export interface Props {
        primitive: FernRegistry.PrimitiveType;
        shouldIncludeArticle?: boolean;
        plural?: boolean;
    }
}

export const PrimitivePreviewPart: React.FC<PrimitivePreviewPart.Props> = ({
    primitive,
    shouldIncludeArticle = false,
    plural = false,
}) => {
    const parsed = parsePrimitive(primitive, { plural });
    return (
        <TypeString article={shouldIncludeArticle ? parsed.article : undefined}>{parsed.primitiveString}</TypeString>
    );
};

interface PrimitiveStringWithArticle {
    article?: string;
    primitiveString: string;
}

function parsePrimitive(
    primitive: FernRegistry.PrimitiveType,
    { plural }: { plural: boolean }
): PrimitiveStringWithArticle {
    const constructParsedPrimitive = (article: string, primitiveString: string) => ({ article, primitiveString });

    return primitive._visit<PrimitiveStringWithArticle>({
        string: () => (plural ? { primitiveString: "strings" } : constructParsedPrimitive("a", "string")),
        integer: () => (plural ? { primitiveString: "integers" } : constructParsedPrimitive("an", "integer")),
        double: () => (plural ? { primitiveString: "doubles" } : constructParsedPrimitive("a", "double")),
        long: () => (plural ? { primitiveString: "longs" } : constructParsedPrimitive("a", "long")),
        boolean: () => (plural ? { primitiveString: "boolean" } : constructParsedPrimitive("a", "boolean")),
        datetime: () => (plural ? { primitiveString: "datetimes" } : constructParsedPrimitive("a", "datetime")),
        uuid: () => (plural ? { primitiveString: "UUIDs" } : constructParsedPrimitive("a", "UUID")),
        _other: () => ({ article: undefined, primitiveString: "<unknown>" }),
    });
}
