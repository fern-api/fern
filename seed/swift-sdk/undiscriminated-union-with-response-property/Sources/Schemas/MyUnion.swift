import Foundation

/// Undiscriminated union with multiple object variants.
/// This reproduces the Pipedream issue where Emitter is a union of
/// DeployedComponent, HttpInterface, and TimerInterface.
public enum MyUnion: Codable, Hashable, Sendable {
    case variantA(VariantA)
    case variantB(VariantB)
    case variantC(VariantC)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(VariantA.self) {
            self = .variantA(value)
        } else if let value = try? container.decode(VariantB.self) {
            self = .variantB(value)
        } else if let value = try? container.decode(VariantC.self) {
            self = .variantC(value)
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
        case .variantA(let value):
            try container.encode(value)
        case .variantB(let value):
            try container.encode(value)
        case .variantC(let value):
            try container.encode(value)
        }
    }
}