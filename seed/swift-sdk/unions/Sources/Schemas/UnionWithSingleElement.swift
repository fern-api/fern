public enum UnionWithSingleElement: Codable, Hashable, Sendable {
    case foo(Foo)

    public struct Foo: Codable, Hashable, Sendable {
        public let type: String = "foo"
        public let name: String
        public let additionalProperties: [String: JSONValue]

        public init(type: String, name: String, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}