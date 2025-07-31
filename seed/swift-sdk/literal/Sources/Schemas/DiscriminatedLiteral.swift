public enum DiscriminatedLiteral: Codable, Hashable, Sendable {
    case customName(CustomName)
    case defaultName(DefaultName)
    case george(George)
    case literalGeorge(LiteralGeorge)

    public struct CustomName: Codable, Hashable, Sendable {
        public let value: String

        public init(value: String) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct DefaultName: Codable, Hashable, Sendable {
        public let value: JSONValue

        public init(value: JSONValue) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct George: Codable, Hashable, Sendable {
        public let value: Bool

        public init(value: Bool) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct LiteralGeorge: Codable, Hashable, Sendable {
        public let value: JSONValue

        public init(value: JSONValue) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}