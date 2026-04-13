import Foundation

/// Test object with nullable and optional fields
public struct UserProfile: Codable, Hashable, Sendable {
    public let id: String
    public let username: String
    public let nullableString: Nullable<String>
    public let nullableInteger: Nullable<Int>
    public let nullableBoolean: Nullable<Bool>
    public let nullableDate: Nullable<Date>
    public let nullableObject: Address
    public let nullableList: Nullable<[String]>
    public let nullableMap: Nullable<[String: Nullable<String>]>
    public let optionalString: Nullable<String>?
    public let optionalInteger: Nullable<Int>?
    public let optionalBoolean: Nullable<Bool>?
    public let optionalDate: Nullable<Date>?
    public let optionalObject: Address?
    public let optionalList: Nullable<[String]>?
    public let optionalMap: Nullable<[String: Nullable<String>]>?
    public let optionalNullableString: Nullable<String>?
    public let optionalNullableObject: Address?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        id: String,
        username: String,
        nullableString: Nullable<String>,
        nullableInteger: Nullable<Int>,
        nullableBoolean: Nullable<Bool>,
        nullableDate: Nullable<Date>,
        nullableObject: Address,
        nullableList: Nullable<[String]>,
        nullableMap: Nullable<[String: Nullable<String>]>,
        optionalString: Nullable<String>? = nil,
        optionalInteger: Nullable<Int>? = nil,
        optionalBoolean: Nullable<Bool>? = nil,
        optionalDate: Nullable<Date>? = nil,
        optionalObject: Address? = nil,
        optionalList: Nullable<[String]>? = nil,
        optionalMap: Nullable<[String: Nullable<String>]>? = nil,
        optionalNullableString: Nullable<String>? = nil,
        optionalNullableObject: Address? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.id = id
        self.username = username
        self.nullableString = nullableString
        self.nullableInteger = nullableInteger
        self.nullableBoolean = nullableBoolean
        self.nullableDate = nullableDate
        self.nullableObject = nullableObject
        self.nullableList = nullableList
        self.nullableMap = nullableMap
        self.optionalString = optionalString
        self.optionalInteger = optionalInteger
        self.optionalBoolean = optionalBoolean
        self.optionalDate = optionalDate
        self.optionalObject = optionalObject
        self.optionalList = optionalList
        self.optionalMap = optionalMap
        self.optionalNullableString = optionalNullableString
        self.optionalNullableObject = optionalNullableObject
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(String.self, forKey: .id)
        self.username = try container.decode(String.self, forKey: .username)
        self.nullableString = try container.decode(Nullable<String>.self, forKey: .nullableString)
        self.nullableInteger = try container.decode(Nullable<Int>.self, forKey: .nullableInteger)
        self.nullableBoolean = try container.decode(Nullable<Bool>.self, forKey: .nullableBoolean)
        self.nullableDate = try container.decode(Nullable<Date>.self, forKey: .nullableDate)
        self.nullableObject = try container.decode(Address.self, forKey: .nullableObject)
        self.nullableList = try container.decode(Nullable<[String]>.self, forKey: .nullableList)
        self.nullableMap = try container.decode(Nullable<[String: Nullable<String>]>.self, forKey: .nullableMap)
        self.optionalString = try container.decodeNullableIfPresent(String.self, forKey: .optionalString)
        self.optionalInteger = try container.decodeNullableIfPresent(Int.self, forKey: .optionalInteger)
        self.optionalBoolean = try container.decodeNullableIfPresent(Bool.self, forKey: .optionalBoolean)
        self.optionalDate = try container.decodeNullableIfPresent(Date.self, forKey: .optionalDate)
        self.optionalObject = try container.decodeIfPresent(Address.self, forKey: .optionalObject)
        self.optionalList = try container.decodeNullableIfPresent([String].self, forKey: .optionalList)
        self.optionalMap = try container.decodeNullableIfPresent([String: Nullable<String>].self, forKey: .optionalMap)
        self.optionalNullableString = try container.decodeNullableIfPresent(String.self, forKey: .optionalNullableString)
        self.optionalNullableObject = try container.decodeIfPresent(Address.self, forKey: .optionalNullableObject)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.id, forKey: .id)
        try container.encode(self.username, forKey: .username)
        try container.encode(self.nullableString, forKey: .nullableString)
        try container.encode(self.nullableInteger, forKey: .nullableInteger)
        try container.encode(self.nullableBoolean, forKey: .nullableBoolean)
        try container.encode(self.nullableDate, forKey: .nullableDate)
        try container.encode(self.nullableObject, forKey: .nullableObject)
        try container.encode(self.nullableList, forKey: .nullableList)
        try container.encode(self.nullableMap, forKey: .nullableMap)
        try container.encodeNullableIfPresent(self.optionalString, forKey: .optionalString)
        try container.encodeNullableIfPresent(self.optionalInteger, forKey: .optionalInteger)
        try container.encodeNullableIfPresent(self.optionalBoolean, forKey: .optionalBoolean)
        try container.encodeNullableIfPresent(self.optionalDate, forKey: .optionalDate)
        try container.encodeIfPresent(self.optionalObject, forKey: .optionalObject)
        try container.encodeNullableIfPresent(self.optionalList, forKey: .optionalList)
        try container.encodeNullableIfPresent(self.optionalMap, forKey: .optionalMap)
        try container.encodeNullableIfPresent(self.optionalNullableString, forKey: .optionalNullableString)
        try container.encodeIfPresent(self.optionalNullableObject, forKey: .optionalNullableObject)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case id
        case username
        case nullableString
        case nullableInteger
        case nullableBoolean
        case nullableDate
        case nullableObject
        case nullableList
        case nullableMap
        case optionalString
        case optionalInteger
        case optionalBoolean
        case optionalDate
        case optionalObject
        case optionalList
        case optionalMap
        case optionalNullableString
        case optionalNullableObject
    }
}