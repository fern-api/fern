import Foundation

public indirect enum Animal: Codable, Hashable, Sendable {
    case cat(Cat)
    case dog(Dog)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(Cat.self) {
            self = .cat(value)
        } else if let value = try? container.decode(Dog.self) {
            self = .dog(value)
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
        case .cat(let value):
            try container.encode(value)
        case .dog(let value):
            try container.encode(value)
        }
    }
}