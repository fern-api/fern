import Foundation

public enum TypesAnimal: Codable, Hashable, Sendable {
    case typesAnimalOne(TypesAnimalOne)
    case typesAnimalZero(TypesAnimalZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(TypesAnimalOne.self) {
            self = .typesAnimalOne(value)
        } else if let value = try? container.decode(TypesAnimalZero.self) {
            self = .typesAnimalZero(value)
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
        case .typesAnimalOne(let value):
            try container.encode(value)
        case .typesAnimalZero(let value):
            try container.encode(value)
        }
    }
}