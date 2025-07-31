public enum UnionWithOptionalTime: Codable, Hashable, Sendable {
    case date(Date)
    case datetime(Datetime)

    public struct Date: Codable, Hashable, Sendable {
        public let value: Date?

        public init(value: Date?) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Datetime: Codable, Hashable, Sendable {
        public let value: Date?

        public init(value: Date?) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}