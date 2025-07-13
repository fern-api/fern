public struct NestedObjectWithRequiredField: Codable, Hashable {
    public let string: String
    public let nestedObject: ObjectWithOptionalField

    enum CodingKeys: String, CodingKey {
        case string
        case nestedObject = "NestedObject"
    }
}