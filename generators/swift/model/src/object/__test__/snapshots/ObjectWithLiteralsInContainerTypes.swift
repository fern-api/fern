public struct ObjectWithLiteralsInContainerTypes: Codable, Hashable, Sendable {
    public let stringField: String
    public let intField: Int?
    public let literalFieldAbc: Abc
    public let optionalFieldAbc: Abc?
    public let optionalLiteralFieldDef: Def?
    public let listOfLiteralsFieldGhi: [Ghi]
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        stringField: String,
        intField: Int? = nil,
        literalFieldAbc: Abc,
        optionalFieldAbc: Abc? = nil,
        optionalLiteralFieldDef: Def? = nil,
        listOfLiteralsFieldGhi: [Ghi],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.stringField = stringField
        self.intField = intField
        self.literalFieldAbc = literalFieldAbc
        self.optionalFieldAbc = optionalFieldAbc
        self.optionalLiteralFieldDef = optionalLiteralFieldDef
        self.listOfLiteralsFieldGhi = listOfLiteralsFieldGhi
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.stringField = try container.decode(String.self, forKey: .stringField)
        self.intField = try container.decodeIfPresent(Int.self, forKey: .intField)
        self.literalFieldAbc = try container.decode(Abc.self, forKey: .literalFieldAbc)
        self.optionalFieldAbc = try container.decodeIfPresent(Abc.self, forKey: .optionalFieldAbc)
        self.optionalLiteralFieldDef = try container.decodeIfPresent(Def.self, forKey: .optionalLiteralFieldDef)
        self.listOfLiteralsFieldGhi = try container.decode([Ghi].self, forKey: .listOfLiteralsFieldGhi)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.stringField, forKey: .stringField)
        try container.encodeIfPresent(self.intField, forKey: .intField)
        try container.encode(self.literalFieldAbc, forKey: .literalFieldAbc)
        try container.encodeIfPresent(self.optionalFieldAbc, forKey: .optionalFieldAbc)
        try container.encodeIfPresent(self.optionalLiteralFieldDef, forKey: .optionalLiteralFieldDef)
        try container.encode(self.listOfLiteralsFieldGhi, forKey: .listOfLiteralsFieldGhi)
    }

    public enum Abc: String, Codable, Hashable, CaseIterable, Sendable {
        case abc
    }

    public enum Def: String, Codable, Hashable, CaseIterable, Sendable {
        case def
    }

    public enum Ghi: String, Codable, Hashable, CaseIterable, Sendable {
        case ghi
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case stringField
        case intField
        case literalFieldAbc
        case optionalFieldAbc
        case optionalLiteralFieldDef
        case listOfLiteralsFieldGhi
    }
}