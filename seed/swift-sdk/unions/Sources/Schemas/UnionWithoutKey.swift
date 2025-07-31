public enum UnionWithoutKey: Codable, Hashable, Sendable {
    case foo(Foo)
    case bar(Bar)

    public struct Foo: Codable, Hashable, Sendable {
        public let type: String = "foo"
        public let name: String
        public let additionalProperties: [String: JSONValue]

        public init(type: String, name: String, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Bar: Codable, Hashable, Sendable {
        public let type: String = "bar"
        public let name: String
        public let additionalProperties: [String: JSONValue]

        public init(type: String, name: String, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}