public enum Resource: Codable, Hashable, Sendable {
    case user(User)
    case organization(Organization)

    public struct User: Codable, Hashable, Sendable {
        public let resourceType: String = "user"
        public let userName: String
        public let metadataTags: [String]
        public let extraProperties: [String: String]
        public let additionalProperties: [String: JSONValue]

        public init(resourceType: String, userName: String, metadataTags: [String], extraProperties: [String: String], additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Organization: Codable, Hashable, Sendable {
        public let resourceType: String = "Organization"
        public let name: String
        public let additionalProperties: [String: JSONValue]

        public init(resourceType: String, name: String, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}