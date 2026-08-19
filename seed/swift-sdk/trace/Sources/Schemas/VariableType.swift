import Foundation

public indirect enum VariableType: Codable, Hashable, Sendable {
    case binaryTreeType
    case booleanType
    case charType
    case doubleType
    case doublyLinkedListType
    case integerType
    case listType(ListType)
    case mapType(MapType)
    case singlyLinkedListType
    case stringType

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "binaryTreeType":
            self = .binaryTreeType
        case "booleanType":
            self = .booleanType
        case "charType":
            self = .charType
        case "doubleType":
            self = .doubleType
        case "doublyLinkedListType":
            self = .doublyLinkedListType
        case "integerType":
            self = .integerType
        case "listType":
            self = .listType(try ListType(from: decoder))
        case "mapType":
            self = .mapType(try MapType(from: decoder))
        case "singlyLinkedListType":
            self = .singlyLinkedListType
        case "stringType":
            self = .stringType
        default:
            throw DecodingError.dataCorrupted(
                DecodingError.Context(
                    codingPath: decoder.codingPath,
                    debugDescription: "Unknown shape discriminant value: \(discriminant)"
                )
            )
        }
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        switch self {
        case .binaryTreeType:
            try container.encode("binaryTreeType", forKey: .type)
        case .booleanType:
            try container.encode("booleanType", forKey: .type)
        case .charType:
            try container.encode("charType", forKey: .type)
        case .doubleType:
            try container.encode("doubleType", forKey: .type)
        case .doublyLinkedListType:
            try container.encode("doublyLinkedListType", forKey: .type)
        case .integerType:
            try container.encode("integerType", forKey: .type)
        case .listType(let data):
            try container.encode("listType", forKey: .type)
            try data.encode(to: encoder)
        case .mapType(let data):
            try container.encode("mapType", forKey: .type)
            try data.encode(to: encoder)
        case .singlyLinkedListType:
            try container.encode("singlyLinkedListType", forKey: .type)
        case .stringType:
            try container.encode("stringType", forKey: .type)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}