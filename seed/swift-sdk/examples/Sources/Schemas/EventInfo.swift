public enum EventInfo: Codable, Hashable, Sendable {
    case metadata(Metadata)
    case tag(Tag)

    public struct Metadata: Codable, Hashable, Sendable {
        public let type: String = "metadata"
        public let id: String
        public let data: [String: String]?
        public let jsonString: String?
        public let additionalProperties: [String: JSONValue]

        public init(type: String, id: String, data: [String: String]?, jsonString: String?, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Tag: Codable, Hashable, Sendable {
        public let value: Tag

        public init(value: Tag) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}