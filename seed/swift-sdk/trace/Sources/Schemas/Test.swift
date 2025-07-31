public enum Test: Codable, Hashable, Sendable {
    case and(And)
    case or(Or)

    public struct And: Codable, Hashable, Sendable {
        public let value: Bool

        public init(value: Bool) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Or: Codable, Hashable, Sendable {
        public let value: Bool

        public init(value: Bool) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}