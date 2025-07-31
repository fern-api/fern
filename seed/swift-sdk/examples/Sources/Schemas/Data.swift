public enum Data: Codable, Hashable, Sendable {
    case string(String)
    case base64(Base64)

    public struct String: Codable, Hashable, Sendable {
        public let value: String

        public init(value: String) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Base64: Codable, Hashable, Sendable {
        public let value: String

        public init(value: String) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}