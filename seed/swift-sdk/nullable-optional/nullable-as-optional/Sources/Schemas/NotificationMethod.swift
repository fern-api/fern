import Foundation

/// Discriminated union for testing nullable unions
public enum NotificationMethod: Codable, Hashable, Sendable {
    case notificationMethodOne(NotificationMethodOne)
    case notificationMethodTwo(NotificationMethodTwo)
    case notificationMethodZero(NotificationMethodZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(NotificationMethodOne.self) {
            self = .notificationMethodOne(value)
        } else if let value = try? container.decode(NotificationMethodTwo.self) {
            self = .notificationMethodTwo(value)
        } else if let value = try? container.decode(NotificationMethodZero.self) {
            self = .notificationMethodZero(value)
        } else {
            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Unexpected value."
            )
        }
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.singleValueContainer()
        switch self {
        case .notificationMethodOne(let value):
            try container.encode(value)
        case .notificationMethodTwo(let value):
            try container.encode(value)
        case .notificationMethodZero(let value):
            try container.encode(value)
        }
    }
}