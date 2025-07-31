public enum UnionWithLiteral: Codable, Hashable, Sendable {
    case fern(Fern)

    public struct Fern: Codable, Hashable, Sendable {
        public let value: JSONValue

        public init(value: JSONValue) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}