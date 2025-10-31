import Foundation

/// Discriminated union for testing nullable unions
public enum NotificationMethod: Codable, Hashable, Sendable {
    case email(Email)
    case push(Push)
    case sms(Sms)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "email":
            self = .email(try Email(from: decoder))
        case "push":
            self = .push(try Push(from: decoder))
        case "sms":
            self = .sms(try Sms(from: decoder))
        default:
            throw DecodingError.dataCorrupted(
                DecodingError.Context(
                    codingPath: decoder.codingPath,
                    debugDescription: "Unknown shape discriminant value: \(discriminant)"
                )
            )
        }
    }

    public func encode(to encoder: Encoder) throws -> Void {
        switch self {
        case .email(let data):
            try data.encode(to: encoder)
        case .push(let data):
            try data.encode(to: encoder)
        case .sms(let data):
            try data.encode(to: encoder)
        }
    }

    public struct Email: Codable, Hashable, Sendable {
        public let type: String = "email"
        public let emailAddress: String
        public let subject: String
        public let htmlContent: String?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            emailAddress: String,
            subject: String,
            htmlContent: String? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.emailAddress = emailAddress
            self.subject = subject
            self.htmlContent = htmlContent
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.emailAddress = try container.decode(String.self, forKey: .emailAddress)
            self.subject = try container.decode(String.self, forKey: .subject)
            self.htmlContent = try container.decodeIfPresent(String.self, forKey: .htmlContent)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.emailAddress, forKey: .emailAddress)
            try container.encode(self.subject, forKey: .subject)
            try container.encodeIfPresent(self.htmlContent, forKey: .htmlContent)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case emailAddress
            case subject
            case htmlContent
        }
    }

    public struct Sms: Codable, Hashable, Sendable {
        public let type: String = "sms"
        public let phoneNumber: String
        public let message: String
        public let shortCode: String?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            phoneNumber: String,
            message: String,
            shortCode: String? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.phoneNumber = phoneNumber
            self.message = message
            self.shortCode = shortCode
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.phoneNumber = try container.decode(String.self, forKey: .phoneNumber)
            self.message = try container.decode(String.self, forKey: .message)
            self.shortCode = try container.decodeIfPresent(String.self, forKey: .shortCode)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.phoneNumber, forKey: .phoneNumber)
            try container.encode(self.message, forKey: .message)
            try container.encodeIfPresent(self.shortCode, forKey: .shortCode)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case phoneNumber
            case message
            case shortCode
        }
    }

    public struct Push: Codable, Hashable, Sendable {
        public let type: String = "push"
        public let deviceToken: String
        public let title: String
        public let body: String
        public let badge: Int?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            deviceToken: String,
            title: String,
            body: String,
            badge: Int? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.deviceToken = deviceToken
            self.title = title
            self.body = body
            self.badge = badge
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.deviceToken = try container.decode(String.self, forKey: .deviceToken)
            self.title = try container.decode(String.self, forKey: .title)
            self.body = try container.decode(String.self, forKey: .body)
            self.badge = try container.decodeIfPresent(Int.self, forKey: .badge)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.deviceToken, forKey: .deviceToken)
            try container.encode(self.title, forKey: .title)
            try container.encode(self.body, forKey: .body)
            try container.encodeIfPresent(self.badge, forKey: .badge)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case deviceToken
            case title
            case body
            case badge
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}