import Foundation

extension Requests {
    public struct UpdateTeamMemberRequest: Codable, Hashable, Sendable {
        public let givenName: String?
        public let familyName: String?
        public let emailAddress: String?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            givenName: String? = nil,
            familyName: String? = nil,
            emailAddress: String? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.givenName = givenName
            self.familyName = familyName
            self.emailAddress = emailAddress
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.givenName = try container.decodeIfPresent(String.self, forKey: .givenName)
            self.familyName = try container.decodeIfPresent(String.self, forKey: .familyName)
            self.emailAddress = try container.decodeIfPresent(String.self, forKey: .emailAddress)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encodeIfPresent(self.givenName, forKey: .givenName)
            try container.encodeIfPresent(self.familyName, forKey: .familyName)
            try container.encodeIfPresent(self.emailAddress, forKey: .emailAddress)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case givenName = "given_name"
            case familyName = "family_name"
            case emailAddress = "email_address"
        }
    }
}