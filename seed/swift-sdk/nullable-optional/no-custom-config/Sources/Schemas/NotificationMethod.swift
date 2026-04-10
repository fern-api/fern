import Foundation

/// Discriminated union for testing nullable unions
public enum NotificationMethod: Codable, Hashable, Sendable {
    case email(EmailNotification)
    case push(PushNotification)
    case sms(SmsNotification)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "email":
            self = .email(try EmailNotification(from: decoder))
        case "push":
            self = .push(try PushNotification(from: decoder))
        case "sms":
            self = .sms(try SmsNotification(from: decoder))
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
        var container = encoder.container(keyedBy: CodingKeys.self)
        switch self {
        case .email(let data):
            try container.encode("email", forKey: .type)
            try data.encode(to: encoder)
        case .push(let data):
            try container.encode("push", forKey: .type)
            try data.encode(to: encoder)
        case .sms(let data):
            try container.encode("sms", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}