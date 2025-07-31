public enum UnionWithPrimitive: Codable, Hashable, Sendable {
    case integer(Integer)
    case string(String)

    public struct Integer: Codable, Hashable, Sendable {
        public let value: Int

        public init(value: Int) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct String: Codable, Hashable, Sendable {
        public let value: String

        public init(value: String) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}