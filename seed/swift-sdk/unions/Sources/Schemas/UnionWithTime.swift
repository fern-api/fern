public enum UnionWithTime: Codable, Hashable, Sendable {
    case value(Value)
    case date(Date)
    case datetime(Datetime)

    public struct Value: Codable, Hashable, Sendable {
        public let value: Int

        public init(value: Int) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Date: Codable, Hashable, Sendable {
        public let value: Date

        public init(value: Date) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Datetime: Codable, Hashable, Sendable {
        public let value: Date

        public init(value: Date) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}