import { AbsoluteFilePath, streamObjectFromFile } from "@fern-api/fs-utils"

export declare namespace parseIR {
    export interface Args<IntermediateRepresentation> {
        absolutePathToIR: AbsoluteFilePath
        parse: (raw: unknown, opts?: SchemaOptions) => MaybePromise<MaybeValid<IntermediateRepresentation>>
    }

    /* Copy some types across the IR SDKs */
    export type MaybePromise<T> = T | Promise<T>

    export type MaybeValid<T> = Valid<T> | Invalid

    export interface Valid<T> {
        ok: true
        value: T
    }

    export interface Invalid {
        ok: false
        errors: unknown[]
    }

    interface SchemaOptions {
        /**
         * how to handle unrecognized keys in objects
         *
         * @default "fail"
         */
        unrecognizedObjectKeys?: "fail" | "passthrough" | "strip"
        /**
         * whether to fail when an unrecognized discriminant value is
         * encountered in a union
         *
         * @default false
         */
        allowUnrecognizedUnionMembers?: boolean
        /**
         * whether to fail when an unrecognized enum value is encountered
         *
         * @default false
         */
        allowUnrecognizedEnumValues?: boolean
        /**
         * whether to allow data that doesn't conform to the schema.
         * invalid data is passed through without transformation.
         *
         * when this is enabled, .parse() and .json() will always
         * return `ok: true`. `.parseOrThrow()` and `.jsonOrThrow()`
         * will never fail.
         *
         * @default false
         */
        skipValidation?: boolean
        /**
         * each validation failure contains a "path" property, which is
         * the breadcrumbs to the offending node in the JSON. you can supply
         * a prefix that is prepended to all the errors' paths. this can be
         * helpful for zurg's internal debug logging.
         */
        breadcrumbsPrefix?: string[]
    }
}

export async function parseIR<IR>({ absolutePathToIR, parse }: parseIR.Args<IR>): Promise<IR> {
    const irJson = await streamObjectFromFile(absolutePathToIR)
    // biome-ignore lint/suspicious/noConsole: allow console
    console.log(`Parsed ${absolutePathToIR}`)
    const parsedIR = await parse(irJson, {
        unrecognizedObjectKeys: "passthrough",
        allowUnrecognizedEnumValues: true,
        allowUnrecognizedUnionMembers: true
    })

    if (!parsedIR.ok) {
        // biome-ignore lint/suspicious/noConsole: allow console
        console.log(`Failed to parse ${absolutePathToIR}`)
        throw new Error(`Failed to parse IR: ${JSON.stringify(parsedIR.errors, null, 4)}`)
    }

    return parsedIR.value
}
