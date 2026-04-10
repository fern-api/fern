import Foundation

public enum Shape: Codable, Hashable, Sendable {
    case shapeOne(ShapeOne)
    case shapeZero(ShapeZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(ShapeOne.self) {
            self = .shapeOne(value)
        } else if let value = try? container.decode(ShapeZero.self) {
            self = .shapeZero(value)
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
        case .shapeOne(let value):
            try container.encode(value)
        case .shapeZero(let value):
            try container.encode(value)
        }
    }
}