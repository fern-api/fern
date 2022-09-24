import { ts } from "ts-morph";

export interface Zurg {
    object: (properties: Zurg.Property[]) => Zurg.ObjectLikeSchema;
    list: (itemSchema: Zurg.Schema) => Zurg.Schema;
    string: () => void;
    number: () => void;
    boolean: () => void;
}

export declare namespace Zurg {
    interface Schema {
        parse: () => ts.TypeNode;
        json: () => ts.TypeNode;
    }

    interface ObjectLikeSchema extends Schema {
        withProperties: (properties: Record<string, AdditionalPropertyValueGetter>) => Zurg.Schema;
    }

    interface Property {
        key: {
            parsed: string;
            raw: string;
        };
        value: Schema;
    }

    type AdditionalPropertyValueGetter = (args: {
        property: string;
        getReferenceToParsed: () => ts.Expression;
    }) => ts.Expression;
}
