/* eslint-disable jest/no-export */
import { Schema, SchemaOptions } from "../../Schema";

export function itSchemaIdentity<T>(
    schema: Schema<T, T>,
    value: T,
    { title = "functions as identity" }: { title?: string } = {}
): void {
    itSchema(title, schema, { raw: value, parsed: value });
}

export function itSchema<Raw, Parsed>(
    title: string,
    schema: Schema<Raw, Parsed>,
    {
        raw,
        parsed,
        opts,
    }: {
        raw: Raw;
        parsed: Parsed;
        opts?: SchemaOptions;
    }
): void {
    // eslint-disable-next-line jest/valid-title
    describe(title, () => {
        itParse("parse()", schema, { raw, parsed, opts });
        itJson("json()", schema, { raw, parsed, opts });
    });
}

export function itParse<Raw, Parsed>(
    title: string,
    schema: Schema<Raw, Parsed>,
    {
        raw,
        parsed,
        opts,
    }: {
        raw: Raw;
        parsed: Parsed;
        opts?: SchemaOptions;
    }
): void {
    // eslint-disable-next-line jest/valid-title
    it(title, () => {
        expect(schema.parse(raw, opts)).toEqual(parsed);
    });
}

export function itJson<Raw, Parsed>(
    title: string,
    schema: Schema<Raw, Parsed>,
    {
        raw,
        parsed,
        opts,
    }: {
        raw: Raw;
        parsed: Parsed;
        opts?: SchemaOptions;
    }
): void {
    // eslint-disable-next-line jest/valid-title
    it(title, () => {
        expect(schema.json(parsed, opts)).toEqual(raw);
    });
}
