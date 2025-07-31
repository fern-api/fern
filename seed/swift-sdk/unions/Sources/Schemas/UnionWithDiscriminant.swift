public enum UnionWithDiscriminant: Codable, Hashable, Sendable {
    case foo(Foo)
    case bar(Bar)

    public struct Foo: Codable, Hashable, Sendable {
        public let foo: Foo

        public init(foo: Foo) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Bar: Codable, Hashable, Sendable {
        public let bar: Bar

        public init(bar: Bar) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}