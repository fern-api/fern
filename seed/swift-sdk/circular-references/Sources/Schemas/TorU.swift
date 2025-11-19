import Foundation

public indirect enum TorU: Codable, Hashable, Sendable {
    case t(T)
    case u(U)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(T.self) {
            self = .t(value)
        } else if let value = try? container.decode(U.self) {
            self = .u(value)
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
        case .t(let value):
            try container.encode(value)
        case .u(let value):
            try container.encode(value)
        }
    }
}