import Foundation

/// Request body for testing deserialization of null values
public struct DeserializationTestRequest: Codable, Hashable, Sendable {
    public let requiredString: String
    public let nullableString: Nullable<String>
    public let optionalString: Nullable<String>?
    public let optionalNullableString: Nullable<String>?
    public let nullableEnum: UserRole
    public let optionalEnum: UserStatus?
    public let nullableUnion: NotificationMethod
    public let optionalUnion: SearchResult?
    public let nullableList: Nullable<[String]>
    public let nullableMap: Nullable<[String: Nullable<Int>]>
    public let nullableObject: Address
    public let optionalObject: Organization?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        requiredString: String,
        nullableString: Nullable<String>,
        optionalString: Nullable<String>? = nil,
        optionalNullableString: Nullable<String>? = nil,
        nullableEnum: UserRole,
        optionalEnum: UserStatus? = nil,
        nullableUnion: NotificationMethod,
        optionalUnion: SearchResult? = nil,
        nullableList: Nullable<[String]>,
        nullableMap: Nullable<[String: Nullable<Int>]>,
        nullableObject: Address,
        optionalObject: Organization? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.requiredString = requiredString
        self.nullableString = nullableString
        self.optionalString = optionalString
        self.optionalNullableString = optionalNullableString
        self.nullableEnum = nullableEnum
        self.optionalEnum = optionalEnum
        self.nullableUnion = nullableUnion
        self.optionalUnion = optionalUnion
        self.nullableList = nullableList
        self.nullableMap = nullableMap
        self.nullableObject = nullableObject
        self.optionalObject = optionalObject
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.requiredString = try container.decode(String.self, forKey: .requiredString)
        self.nullableString = try container.decode(Nullable<String>.self, forKey: .nullableString)
        self.optionalString = try container.decodeNullableIfPresent(String.self, forKey: .optionalString)
        self.optionalNullableString = try container.decodeNullableIfPresent(String.self, forKey: .optionalNullableString)
        self.nullableEnum = try container.decode(UserRole.self, forKey: .nullableEnum)
        self.optionalEnum = try container.decodeIfPresent(UserStatus.self, forKey: .optionalEnum)
        self.nullableUnion = try container.decode(NotificationMethod.self, forKey: .nullableUnion)
        self.optionalUnion = try container.decodeIfPresent(SearchResult.self, forKey: .optionalUnion)
        self.nullableList = try container.decode(Nullable<[String]>.self, forKey: .nullableList)
        self.nullableMap = try container.decode(Nullable<[String: Nullable<Int>]>.self, forKey: .nullableMap)
        self.nullableObject = try container.decode(Address.self, forKey: .nullableObject)
        self.optionalObject = try container.decodeIfPresent(Organization.self, forKey: .optionalObject)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.requiredString, forKey: .requiredString)
        try container.encode(self.nullableString, forKey: .nullableString)
        try container.encodeNullableIfPresent(self.optionalString, forKey: .optionalString)
        try container.encodeNullableIfPresent(self.optionalNullableString, forKey: .optionalNullableString)
        try container.encode(self.nullableEnum, forKey: .nullableEnum)
        try container.encodeIfPresent(self.optionalEnum, forKey: .optionalEnum)
        try container.encode(self.nullableUnion, forKey: .nullableUnion)
        try container.encodeIfPresent(self.optionalUnion, forKey: .optionalUnion)
        try container.encode(self.nullableList, forKey: .nullableList)
        try container.encode(self.nullableMap, forKey: .nullableMap)
        try container.encode(self.nullableObject, forKey: .nullableObject)
        try container.encodeIfPresent(self.optionalObject, forKey: .optionalObject)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case requiredString
        case nullableString
        case optionalString
        case optionalNullableString
        case nullableEnum
        case optionalEnum
        case nullableUnion
        case optionalUnion
        case nullableList
        case nullableMap
        case nullableObject
        case optionalObject
    }
}