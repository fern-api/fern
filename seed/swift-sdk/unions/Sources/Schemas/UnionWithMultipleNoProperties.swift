public enum UnionWithMultipleNoProperties: Codable, Hashable, Sendable {
    case foo(Foo)
    case empty1(Empty1)
    case empty2(Empty2)

    public struct Foo: Codable, Hashable, Sendable {
        public let type: String = "foo"
        public let name: String
        public let additionalProperties: [String: JSONValue]

        public init(type: String, name: String, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Empty1: Codable, Hashable, Sendable {

        public init() {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Empty2: Codable, Hashable, Sendable {

        public init() {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}