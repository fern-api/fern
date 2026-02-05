import {
    createSourcedArray,
    createSourcedObject,
    type Sourced,
    SourcedBoolean,
    SourcedNullish,
    SourcedNumber,
    SourcedString
} from "@fern-api/source";
import type { YamlDocument, YamlPath } from "./YamlDocument";

export class YamlSourceResolver {
    constructor(private readonly document: YamlDocument) {}

    public toSourced<T>(value: T): Sourced<T> {
        return this.toSourcedInternal(value, []);
    }

    private toSourcedInternal<T>(value: T, path: YamlPath): Sourced<T> {
        const location = this.document.getSourceLocation(path);
        if (value === null) {
            return new SourcedNullish(null, location) as Sourced<T>;
        }
        if (value === undefined) {
            return new SourcedNullish(undefined, location) as Sourced<T>;
        }
        if (Array.isArray(value)) {
            return createSourcedArray({
                value: value,
                location: location,
                wrapChild: (childValue, index) => this.toSourcedInternal(childValue, [...path, index])
            }) as Sourced<T>;
        }
        if (value instanceof Object) {
            return createSourcedObject({
                value: value as object,
                location: location,
                wrapChild: (childValue, key) => this.toSourcedInternal(childValue, [...path, key])
            }) as Sourced<T>;
        }
        switch (typeof value) {
            case "string":
                return new SourcedString(value, location) as Sourced<T>;
            case "number":
                return new SourcedNumber(value, location) as Sourced<T>;
            case "boolean":
                return new SourcedBoolean(value, location) as Sourced<T>;
            default:
                throw new Error(`Unexpected value type: ${typeof value}`);
        }
    }
}
