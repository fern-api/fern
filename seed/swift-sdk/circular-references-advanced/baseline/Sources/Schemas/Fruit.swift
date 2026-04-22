import Foundation

public indirect enum Fruit: Codable, Hashable, Sendable {
    case acai(Acai)
    case fig(Fig)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(Acai.self) {
            self = .acai(value)
        } else if let value = try? container.decode(Fig.self) {
            self = .fig(value)
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
        case .acai(let value):
            try container.encode(value)
        case .fig(let value):
            try container.encode(value)
        }
    }
}