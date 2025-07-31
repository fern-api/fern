public enum UnionWithSubTypes: Codable, Hashable, Sendable {
    case foo(Foo)
    case fooExtended(FooExtended)

    public struct Foo: Codable, Hashable, Sendable {
        public let type: String = "foo"
        public let name: String
        public let additionalProperties: [String: JSONValue]

        public init(type: String, name: String, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct FooExtended: Codable, Hashable, Sendable {
        public let type: String = "fooExtended"
        public let age: Int
        public let additionalProperties: [String: JSONValue]

        public init(type: String, age: Int, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}