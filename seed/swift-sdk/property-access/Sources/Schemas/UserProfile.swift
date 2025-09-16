import Foundation

/// User profile object
public struct UserProfile: Codable, Hashable, Sendable {
    /// The name of the user.
    public let name: String
    /// User profile verification object
    public let verification: UserProfileVerification
    /// The social security number of the user.
    public let ssn: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        name: String,
        verification: UserProfileVerification,
        ssn: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.name = name
        self.verification = verification
        self.ssn = ssn
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.name = try container.decode(String.self, forKey: .name)
        self.verification = try container.decode(UserProfileVerification.self, forKey: .verification)
        self.ssn = try container.decode(String.self, forKey: .ssn)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.name, forKey: .name)
        try container.encode(self.verification, forKey: .verification)
        try container.encode(self.ssn, forKey: .ssn)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case name
        case verification
        case ssn
    }
}