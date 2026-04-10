import Foundation

public enum V2AssertCorrectnessCheck: Codable, Hashable, Sendable {
    case v2AssertCorrectnessCheckOne(V2AssertCorrectnessCheckOne)
    case v2AssertCorrectnessCheckZero(V2AssertCorrectnessCheckZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(V2AssertCorrectnessCheckOne.self) {
            self = .v2AssertCorrectnessCheckOne(value)
        } else if let value = try? container.decode(V2AssertCorrectnessCheckZero.self) {
            self = .v2AssertCorrectnessCheckZero(value)
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
        case .v2AssertCorrectnessCheckOne(let value):
            try container.encode(value)
        case .v2AssertCorrectnessCheckZero(let value):
            try container.encode(value)
        }
    }
}