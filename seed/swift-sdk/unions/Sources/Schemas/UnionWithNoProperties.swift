public enum UnionWithNoProperties: Codable, Hashable, Sendable {
    case foo(Foo)
    case empty(Empty)

    public struct Foo: Codable, Hashable, Sendable {
        public let type: String = "foo"
        public let name: String
        public let additionalProperties: [String: JSONValue]

        public init(type: String, name: String, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Empty: Codable, Hashable, Sendable {

        public init() {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}