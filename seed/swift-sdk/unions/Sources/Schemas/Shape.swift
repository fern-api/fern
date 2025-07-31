public enum Shape: Codable, Hashable, Sendable {
    case circle(Circle)
    case square(Square)

    public struct Circle: Codable, Hashable, Sendable {
        public let type: String = "circle"
        public let radius: Double
        public let additionalProperties: [String: JSONValue]

        public init(type: String, radius: Double, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Square: Codable, Hashable, Sendable {
        public let type: String = "square"
        public let length: Double
        public let additionalProperties: [String: JSONValue]

        public init(type: String, length: Double, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}