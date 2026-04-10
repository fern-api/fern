import Foundation

public enum V2V3AssertCorrectnessCheck: Codable, Hashable, Sendable {
    case v2V3AssertCorrectnessCheckOne(V2V3AssertCorrectnessCheckOne)
    case v2V3AssertCorrectnessCheckZero(V2V3AssertCorrectnessCheckZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(V2V3AssertCorrectnessCheckOne.self) {
            self = .v2V3AssertCorrectnessCheckOne(value)
        } else if let value = try? container.decode(V2V3AssertCorrectnessCheckZero.self) {
            self = .v2V3AssertCorrectnessCheckZero(value)
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
        case .v2V3AssertCorrectnessCheckOne(let value):
            try container.encode(value)
        case .v2V3AssertCorrectnessCheckZero(let value):
            try container.encode(value)
        }
    }
}