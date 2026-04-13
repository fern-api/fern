import Foundation

extension Requests {
    public struct CreateUsernameBodyOptionalProperties: Codable, Hashable, Sendable {
        public let username: Nullable<String>?
        public let password: Nullable<String>?
        public let name: Nullable<String>?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            username: Nullable<String>? = nil,
            password: Nullable<String>? = nil,
            name: Nullable<String>? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.username = username
            self.password = password
            self.name = name
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.username = try container.decodeNullableIfPresent(String.self, forKey: .username)
            self.password = try container.decodeNullableIfPresent(String.self, forKey: .password)
            self.name = try container.decodeNullableIfPresent(String.self, forKey: .name)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encodeNullableIfPresent(self.username, forKey: .username)
            try container.encodeNullableIfPresent(self.password, forKey: .password)
            try container.encodeNullableIfPresent(self.name, forKey: .name)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case username
            case password
            case name
        }
    }
}