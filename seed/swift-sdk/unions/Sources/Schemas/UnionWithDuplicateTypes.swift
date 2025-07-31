public enum UnionWithDuplicateTypes: Codable, Hashable, Sendable {
    case foo1(Foo1)
    case foo2(Foo2)

    public struct Foo1: Codable, Hashable, Sendable {
        public let type: String = "foo1"
        public let name: String
        public let additionalProperties: [String: JSONValue]

        public init(type: String, name: String, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Foo2: Codable, Hashable, Sendable {
        public let type: String = "foo2"
        public let name: String
        public let additionalProperties: [String: JSONValue]

        public init(type: String, name: String, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}