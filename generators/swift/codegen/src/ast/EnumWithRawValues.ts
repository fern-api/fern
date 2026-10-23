import { escapeReservedKeyword, escapeSwiftStringLiteralContent } from "../syntax/index.js";
import { AccessLevel } from "./AccessLevel.js";
import { AstNode, Writer } from "./core/index.js";
import { DocComment } from "./DocComment.js";
import { Protocol } from "./Protocol.js";

export declare namespace EnumWithRawValues {
    interface Case {
        unsafeName: string;
        rawValue: string;
        docs?: DocComment;
    }

    /**
     * Makes the enum forward compatible: a raw value it does not list decodes into this
     * case instead of failing. The enum then implements `RawRepresentable` and `Codable` itself,
     * plus `allCases` when it conforms to `CaseIterable`, so pass `RawRepresentable` rather than
     * `String` as a conformance.
     */
    interface UnknownCase {
        unsafeName: string;
        docs?: DocComment;
    }

    interface Args {
        name: string;
        accessLevel?: AccessLevel;
        conformances?: (Protocol | "String")[];
        cases: Case[];
        unknownCase?: UnknownCase;
        docs?: DocComment;
    }
}

export class EnumWithRawValues extends AstNode {
    public readonly name: string;
    public readonly accessLevel?: AccessLevel;
    public readonly conformances: (Protocol | "String")[];
    public readonly cases: EnumWithRawValues.Case[];
    public readonly unknownCase?: EnumWithRawValues.UnknownCase;
    public readonly docs?: DocComment;

    public constructor({ accessLevel, name, conformances, cases, unknownCase, docs }: EnumWithRawValues.Args) {
        super();
        this.name = name;
        this.accessLevel = accessLevel;
        this.conformances = conformances ?? [];
        this.cases = cases;
        this.unknownCase = unknownCase;
        this.docs = docs;
    }

    public write(writer: Writer): void {
        if (this.docs != null) {
            this.docs.write(writer);
        }
        if (this.accessLevel != null) {
            writer.write(this.accessLevel);
            writer.write(" ");
        }
        writer.write(`enum ${escapeReservedKeyword(this.name)}`);
        this.conformances.forEach((conformance, index) => {
            if (index === 0) {
                writer.write(": ");
            } else if (index > 0) {
                writer.write(", ");
            }
            writer.write(conformance);
        });
        if (this.cases.length === 0 && this.unknownCase == null) {
            writer.write(" {}");
            return;
        }
        writer.write(" {");
        writer.newLine();
        writer.indent();
        if (this.unknownCase != null) {
            this.writeForwardCompatibleBody(writer, this.unknownCase);
        } else {
            this.cases.forEach((case_) => {
                if (case_.docs != null) {
                    case_.docs.write(writer);
                }
                writer.write("case ");
                writer.write(escapeReservedKeyword(case_.unsafeName));
                if (case_.rawValue !== case_.unsafeName) {
                    writer.write(" = ");
                    writer.write(`"${escapeSwiftStringLiteralContent(case_.rawValue)}"`);
                }
                writer.newLine();
            });
        }
        writer.dedent();
        writer.write("}");
    }

    private writeForwardCompatibleBody(writer: Writer, unknownCase: EnumWithRawValues.UnknownCase): void {
        const access = this.accessLevel != null ? `${this.accessLevel} ` : "";
        const unknownName = escapeReservedKeyword(unknownCase.unsafeName);
        const known = this.cases.map((case_) => ({
            name: escapeReservedKeyword(case_.unsafeName),
            rawValue: `"${escapeSwiftStringLiteralContent(case_.rawValue)}"`
        }));
        const writeLines = (lines: string[]) => {
            lines.forEach((line) => {
                if (line.length > 0) {
                    writer.write(line);
                }
                writer.newLine();
            });
        };

        this.cases.forEach((case_) => {
            if (case_.docs != null) {
                case_.docs.write(writer);
            }
            writeLines([`case ${escapeReservedKeyword(case_.unsafeName)}`]);
        });
        if (unknownCase.docs != null) {
            unknownCase.docs.write(writer);
        }
        writeLines([
            `case ${unknownName}(String)`,
            "",
            ...(this.conformances.includes(Protocol.CaseIterable)
                ? [`${access}static let allCases: [Self] = [${known.map(({ name }) => `.${name}`).join(", ")}]`, ""]
                : []),
            `${access}init(rawValue: String) {`,
            "    switch rawValue {",
            ...known.map(({ name, rawValue }) => `    case ${rawValue}: self = .${name}`),
            `    default: self = .${unknownName}(rawValue)`,
            "    }",
            "}",
            "",
            `${access}var rawValue: String {`,
            "    switch self {",
            ...known.map(({ name, rawValue }) => `    case .${name}: return ${rawValue}`),
            `    case .${unknownName}(let rawValue): return rawValue`,
            "    }",
            "}",
            "",
            `${access}init(from decoder: Decoder) throws {`,
            "    self.init(rawValue: try decoder.singleValueContainer().decode(String.self))",
            "}",
            "",
            `${access}func encode(to encoder: Encoder) throws {`,
            "    var container = encoder.singleValueContainer()",
            "    try container.encode(rawValue)",
            "}"
        ]);
    }
}
