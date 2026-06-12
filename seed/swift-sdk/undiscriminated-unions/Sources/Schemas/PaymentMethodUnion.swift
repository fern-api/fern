import Foundation

/// Tests that nested properties with camelCase wire names are properly
/// converted from snake_case Ruby keys when passed as Hash values.
public enum PaymentMethodUnion: Codable, Hashable, Sendable {
    case tokenizeCard(TokenizeCard)
    case convertToken(ConvertToken)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(TokenizeCard.self) {
            self = .tokenizeCard(value)
        } else if let value = try? container.decode(ConvertToken.self) {
            self = .convertToken(value)
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
        case .tokenizeCard(let value):
            try container.encode(value)
        case .convertToken(let value):
            try container.encode(value)
        }
    }
}