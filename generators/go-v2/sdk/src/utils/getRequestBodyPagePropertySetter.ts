import { go } from "@fern-api/go-ast";

export interface RequestBodyPagePathItem {
    /** The Go field name of the intermediate object, e.g. Options */
    fieldName: string;
    type: go.Type;
}

/**
 * Sets the page property on a copy of the caller's request. Every pointer along the property path is
 * replaced with a pointer to a copy of its value (or to a zero value when the caller left it nil), so
 * that neither the caller's request nor any of its nested objects are mutated. The copies are shallow:
 * pointer, slice and map fields inside them still alias the caller's values, which is fine because the
 * only field ever written is the page property.
 */
export function getRequestBodyPagePropertySetter({
    requestReference,
    pagedRequestVariableName,
    propertyPath,
    fieldName,
    value
}: {
    /** e.g. request */
    requestReference: string;
    /** e.g. nextRequest */
    pagedRequestVariableName: string;
    /** The objects that contain the page property, outermost first. Empty for top-level properties. */
    propertyPath: RequestBodyPagePathItem[];
    /** The Go field name of the page property, e.g. Cursor */
    fieldName: string;
    /** e.g. pageRequest.Cursor */
    value: string;
}): go.AstNode {
    return go.codeblock((writer) => {
        writer.writeLine(`${pagedRequestVariableName} := *${requestReference}`);
        let container = pagedRequestVariableName;
        let copyVariableName = pagedRequestVariableName;
        for (const item of propertyPath) {
            const reference = `${container}.${item.fieldName}`;
            copyVariableName += item.fieldName;
            if (!item.type.isOptional()) {
                container = reference;
                continue;
            }
            writer.write(`var ${copyVariableName} `);
            writer.writeNode(item.type.underlying());
            writer.newLine();
            writer.writeLine(`if ${reference} != nil {`);
            writer.indent();
            writer.writeLine(`${copyVariableName} = *${reference}`);
            writer.dedent();
            writer.writeLine("}");
            writer.writeLine(`${reference} = &${copyVariableName}`);
            container = copyVariableName;
        }
        writer.writeLine(`${container}.${fieldName} = ${value}`);
    });
}
