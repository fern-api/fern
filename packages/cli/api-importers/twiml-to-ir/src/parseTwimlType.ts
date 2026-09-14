import { FernIr } from "@fern-api/ir-sdk";

const PRIMITIVE_TYPES: Record<string, FernIr.TwimlPrimitiveType> = {
    string: FernIr.TwimlPrimitiveType.String,
    integer: FernIr.TwimlPrimitiveType.Integer,
    boolean: FernIr.TwimlPrimitiveType.Boolean,
    url: FernIr.TwimlPrimitiveType.Url,
    http_method: FernIr.TwimlPrimitiveType.HttpMethod,
    phone_number: FernIr.TwimlPrimitiveType.PhoneNumber,
    object: FernIr.TwimlPrimitiveType.Object
};

const UNION_SEPARATOR = "|";
const LIST_SUFFIX = "[]";
const ENUM_PREFIX = "enum:";
const SID_PATTERN = /^sid<([A-Za-z]{2})>$/;

export type ParsedTwimlType = { ok: true; type: FernIr.TwimlType } | { ok: false; reason: string };

/**
 * Parses the type grammar used by TwiML definitions:
 *
 *   type   := member ('|' member)*
 *   member := base ('[]')*
 *   base   := string | integer | boolean | url | http_method | phone_number | object
 *           | sid<XX> | enum:<name>
 *
 * `enums` are the enum names declared on the enclosing tag; unknown references are rejected.
 */
export function parseTwimlType({ type, enums }: { type: string; enums: ReadonlySet<string> }): ParsedTwimlType {
    const members = type.split(UNION_SEPARATOR).map((member) => member.trim());
    const parsedMembers: FernIr.TwimlType[] = [];
    for (const member of members) {
        const parsed = parseMember({ member, enums });
        if (!parsed.ok) {
            return parsed;
        }
        parsedMembers.push(parsed.type);
    }
    const [single] = parsedMembers;
    if (single != null && parsedMembers.length === 1) {
        return { ok: true, type: single };
    }
    return { ok: true, type: FernIr.TwimlType.union({ members: parsedMembers }) };
}

function parseMember({ member, enums }: { member: string; enums: ReadonlySet<string> }): ParsedTwimlType {
    if (member.endsWith(LIST_SUFFIX)) {
        const inner = parseMember({ member: member.slice(0, -LIST_SUFFIX.length), enums });
        return inner.ok ? { ok: true, type: FernIr.TwimlType.list(inner.type) } : inner;
    }
    const primitive = PRIMITIVE_TYPES[member];
    if (primitive != null) {
        return { ok: true, type: FernIr.TwimlType.primitive(primitive) };
    }
    const sid = SID_PATTERN.exec(member);
    if (sid?.[1] != null) {
        return { ok: true, type: FernIr.TwimlType.sid({ prefix: sid[1] }) };
    }
    if (member.startsWith(ENUM_PREFIX)) {
        const enumName = member.slice(ENUM_PREFIX.length);
        if (!enums.has(enumName)) {
            return { ok: false, reason: `enum '${enumName}' is not declared on this tag` };
        }
        return { ok: true, type: FernIr.TwimlType.enum(enumName) };
    }
    if (member.length === 0) {
        return { ok: false, reason: "empty type" };
    }
    return {
        ok: false,
        reason: `unknown type '${member}' (expected ${Object.keys(PRIMITIVE_TYPES).join(", ")}, sid<XX>, enum:<name>, or a '[]' list / '|' union of those)`
    };
}
