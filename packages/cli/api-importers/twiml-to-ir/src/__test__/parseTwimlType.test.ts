import { FernIr } from "@fern-api/ir-sdk";
import { describe, expect, it } from "vitest";
import { parseTwimlType } from "../parseTwimlType.js";

const enums = new Set(["voice", "event"]);

function parse(type: string): FernIr.TwimlType {
    const parsed = parseTwimlType({ type, enums });
    if (!parsed.ok) {
        throw new Error(`expected '${type}' to parse: ${parsed.reason}`);
    }
    return parsed.type;
}

function reject(type: string): string {
    const parsed = parseTwimlType({ type, enums });
    if (parsed.ok) {
        throw new Error(`expected '${type}' to be rejected`);
    }
    return parsed.reason;
}

// IR union constructors attach `_visit` closures, so compare the serialized shape.
function shape(type: FernIr.TwimlType): unknown {
    return JSON.parse(JSON.stringify(type));
}

const primitive = (value: FernIr.TwimlPrimitiveType): FernIr.TwimlType => FernIr.TwimlType.primitive(value);

describe("parseTwimlType", () => {
    it("parses every primitive", () => {
        const cases: [string, FernIr.TwimlPrimitiveType][] = [
            ["string", FernIr.TwimlPrimitiveType.String],
            ["integer", FernIr.TwimlPrimitiveType.Integer],
            ["boolean", FernIr.TwimlPrimitiveType.Boolean],
            ["url", FernIr.TwimlPrimitiveType.Url],
            ["http_method", FernIr.TwimlPrimitiveType.HttpMethod],
            ["phone_number", FernIr.TwimlPrimitiveType.PhoneNumber],
            ["object", FernIr.TwimlPrimitiveType.Object]
        ];
        for (const [raw, expected] of cases) {
            expect(shape(parse(raw))).toEqual(shape(primitive(expected)));
        }
    });

    it("parses sid<XX>", () => {
        expect(shape(parse("sid<BY>"))).toEqual(shape(FernIr.TwimlType.sid({ prefix: "BY" })));
    });

    it("parses enum references against the tag's enums", () => {
        expect(shape(parse("enum:voice"))).toEqual(shape(FernIr.TwimlType.enum("voice")));
        expect(reject("enum:nope")).toBe("enum 'nope' is not declared on this tag");
    });

    it("parses lists of enums and primitives", () => {
        expect(shape(parse("enum:event[]"))).toEqual(shape(FernIr.TwimlType.list(FernIr.TwimlType.enum("event"))));
        expect(shape(parse("string[]"))).toEqual(
            shape(FernIr.TwimlType.list(primitive(FernIr.TwimlPrimitiveType.String)))
        );
    });

    it("parses unions in declaration order", () => {
        expect(shape(parse("phone_number|sid<DE>|string"))).toEqual(
            shape(
                FernIr.TwimlType.union({
                    members: [
                        primitive(FernIr.TwimlPrimitiveType.PhoneNumber),
                        FernIr.TwimlType.sid({ prefix: "DE" }),
                        primitive(FernIr.TwimlPrimitiveType.String)
                    ]
                })
            )
        );
    });

    it("rejects unknown type expressions", () => {
        expect(reject("int")).toContain("unknown type 'int'");
        expect(reject("sid<TOOLONG>")).toContain("unknown type");
        expect(reject("")).toBe("empty type");
    });
});
