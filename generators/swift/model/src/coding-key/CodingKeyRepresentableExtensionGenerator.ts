import { swift } from "@fern-api/swift-codegen";

export declare namespace CodingKeyRepresentableExtensionGenerator {
    interface Args {
        /** The name of the type (enum or undiscriminated union) used as a map key. */
        name: string;
    }
}

/**
 * Generates a `CodingKeyRepresentable` conformance for a type used as a `Dictionary`
 * key. Swift only encodes/decodes `[Key: Value]` as a JSON object when `Key` is
 * `String`/`Int` or conforms to `CodingKeyRepresentable`; otherwise it falls back to
 * a JSON array and the round-trip fails for object payloads.
 *
 * The conformance round-trips the key through its own `Codable` representation (a JSON
 * string for valid map keys), which works uniformly for raw-valued enums and
 * undiscriminated unions whose variants are string-representable.
 *
 * `CodingKeyRepresentable` is only available on macOS 12.3+, iOS 15.4+, tvOS 15.4+ and
 * watchOS 8.5+. `Dictionary`'s `Codable` conformance performs the matching runtime
 * `#available` check, so gating the conformance keeps the generated code compiling on
 * the SDK's lower deployment targets while enabling correct behavior where supported.
 */
export class CodingKeyRepresentableExtensionGenerator {
    private readonly name: string;

    public constructor({ name }: CodingKeyRepresentableExtensionGenerator.Args) {
        this.name = name;
    }

    public generate(): swift.Statement {
        return swift.Statement.raw(
            [
                "@available(macOS 12.3, iOS 15.4, tvOS 15.4, watchOS 8.5, *)",
                `extension ${this.name}: CodingKeyRepresentable {`,
                "    public var codingKey: any CodingKey {",
                "        guard let data = try? JSONEncoder().encode(self),",
                "              let stringValue = try? JSONDecoder().decode(String.self, from: data) else {",
                `            fatalError("\\(Self.self) value could not be encoded as a string and cannot be used as a Dictionary key")`,
                "        }",
                "        return StringKey(stringValue)",
                "    }",
                "",
                "    public init?<T>(codingKey: T) where T: CodingKey {",
                "        guard let data = try? JSONEncoder().encode(codingKey.stringValue),",
                "              let value = try? JSONDecoder().decode(Self.self, from: data) else {",
                "            return nil",
                "        }",
                "        self = value",
                "    }",
                "}"
            ].join("\n")
        );
    }
}
