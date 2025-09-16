import Foundation

/// Test object with nullable enums, unions, and arrays
public struct ComplexProfile: Codable, Hashable, Sendable {
    public let id: String
    public let nullableRole: Nullable<UserRole>
    public let optionalRole: UserRole?
    public let optionalNullableRole: Nullable<UserRole>?
    public let nullableStatus: Nullable<UserStatus>
    public let optionalStatus: UserStatus?
    public let optionalNullableStatus: Nullable<UserStatus>?
    public let nullableNotification: Nullable<NotificationMethod>
    public let optionalNotification: NotificationMethod?
    public let optionalNullableNotification: Nullable<NotificationMethod>?
    public let nullableSearchResult: Nullable<SearchResult>
    public let optionalSearchResult: SearchResult?
    public let nullableArray: Nullable<[String]>
    public let optionalArray: [String]?
    public let optionalNullableArray: Nullable<[String]>?
    public let nullableListOfNullables: Nullable<[Nullable<String>]>
    public let nullableMapOfNullables: Nullable<[String: Nullable<Address>]>
    public let nullableListOfUnions: Nullable<[NotificationMethod]>
    public let optionalMapOfEnums: [String: UserRole]?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        id: String,
        nullableRole: Nullable<UserRole>,
        optionalRole: UserRole? = nil,
        optionalNullableRole: Nullable<UserRole>? = nil,
        nullableStatus: Nullable<UserStatus>,
        optionalStatus: UserStatus? = nil,
        optionalNullableStatus: Nullable<UserStatus>? = nil,
        nullableNotification: Nullable<NotificationMethod>,
        optionalNotification: NotificationMethod? = nil,
        optionalNullableNotification: Nullable<NotificationMethod>? = nil,
        nullableSearchResult: Nullable<SearchResult>,
        optionalSearchResult: SearchResult? = nil,
        nullableArray: Nullable<[String]>,
        optionalArray: [String]? = nil,
        optionalNullableArray: Nullable<[String]>? = nil,
        nullableListOfNullables: Nullable<[Nullable<String>]>,
        nullableMapOfNullables: Nullable<[String: Nullable<Address>]>,
        nullableListOfUnions: Nullable<[NotificationMethod]>,
        optionalMapOfEnums: [String: UserRole]? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.id = id
        self.nullableRole = nullableRole
        self.optionalRole = optionalRole
        self.optionalNullableRole = optionalNullableRole
        self.nullableStatus = nullableStatus
        self.optionalStatus = optionalStatus
        self.optionalNullableStatus = optionalNullableStatus
        self.nullableNotification = nullableNotification
        self.optionalNotification = optionalNotification
        self.optionalNullableNotification = optionalNullableNotification
        self.nullableSearchResult = nullableSearchResult
        self.optionalSearchResult = optionalSearchResult
        self.nullableArray = nullableArray
        self.optionalArray = optionalArray
        self.optionalNullableArray = optionalNullableArray
        self.nullableListOfNullables = nullableListOfNullables
        self.nullableMapOfNullables = nullableMapOfNullables
        self.nullableListOfUnions = nullableListOfUnions
        self.optionalMapOfEnums = optionalMapOfEnums
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(String.self, forKey: .id)
        self.nullableRole = try container.decode(Nullable<UserRole>.self, forKey: .nullableRole)
        self.optionalRole = try container.decodeIfPresent(UserRole.self, forKey: .optionalRole)
        self.optionalNullableRole = try container.decodeNullableIfPresent(UserRole.self, forKey: .optionalNullableRole)
        self.nullableStatus = try container.decode(Nullable<UserStatus>.self, forKey: .nullableStatus)
        self.optionalStatus = try container.decodeIfPresent(UserStatus.self, forKey: .optionalStatus)
        self.optionalNullableStatus = try container.decodeNullableIfPresent(UserStatus.self, forKey: .optionalNullableStatus)
        self.nullableNotification = try container.decode(Nullable<NotificationMethod>.self, forKey: .nullableNotification)
        self.optionalNotification = try container.decodeIfPresent(NotificationMethod.self, forKey: .optionalNotification)
        self.optionalNullableNotification = try container.decodeNullableIfPresent(NotificationMethod.self, forKey: .optionalNullableNotification)
        self.nullableSearchResult = try container.decode(Nullable<SearchResult>.self, forKey: .nullableSearchResult)
        self.optionalSearchResult = try container.decodeIfPresent(SearchResult.self, forKey: .optionalSearchResult)
        self.nullableArray = try container.decode(Nullable<[String]>.self, forKey: .nullableArray)
        self.optionalArray = try container.decodeIfPresent([String].self, forKey: .optionalArray)
        self.optionalNullableArray = try container.decodeNullableIfPresent([String].self, forKey: .optionalNullableArray)
        self.nullableListOfNullables = try container.decode(Nullable<[Nullable<String>]>.self, forKey: .nullableListOfNullables)
        self.nullableMapOfNullables = try container.decode(Nullable<[String: Nullable<Address>]>.self, forKey: .nullableMapOfNullables)
        self.nullableListOfUnions = try container.decode(Nullable<[NotificationMethod]>.self, forKey: .nullableListOfUnions)
        self.optionalMapOfEnums = try container.decodeIfPresent([String: UserRole].self, forKey: .optionalMapOfEnums)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.id, forKey: .id)
        try container.encode(self.nullableRole, forKey: .nullableRole)
        try container.encodeIfPresent(self.optionalRole, forKey: .optionalRole)
        try container.encodeNullableIfPresent(self.optionalNullableRole, forKey: .optionalNullableRole)
        try container.encode(self.nullableStatus, forKey: .nullableStatus)
        try container.encodeIfPresent(self.optionalStatus, forKey: .optionalStatus)
        try container.encodeNullableIfPresent(self.optionalNullableStatus, forKey: .optionalNullableStatus)
        try container.encode(self.nullableNotification, forKey: .nullableNotification)
        try container.encodeIfPresent(self.optionalNotification, forKey: .optionalNotification)
        try container.encodeNullableIfPresent(self.optionalNullableNotification, forKey: .optionalNullableNotification)
        try container.encode(self.nullableSearchResult, forKey: .nullableSearchResult)
        try container.encodeIfPresent(self.optionalSearchResult, forKey: .optionalSearchResult)
        try container.encode(self.nullableArray, forKey: .nullableArray)
        try container.encodeIfPresent(self.optionalArray, forKey: .optionalArray)
        try container.encodeNullableIfPresent(self.optionalNullableArray, forKey: .optionalNullableArray)
        try container.encode(self.nullableListOfNullables, forKey: .nullableListOfNullables)
        try container.encode(self.nullableMapOfNullables, forKey: .nullableMapOfNullables)
        try container.encode(self.nullableListOfUnions, forKey: .nullableListOfUnions)
        try container.encodeIfPresent(self.optionalMapOfEnums, forKey: .optionalMapOfEnums)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case id
        case nullableRole
        case optionalRole
        case optionalNullableRole
        case nullableStatus
        case optionalStatus
        case optionalNullableStatus
        case nullableNotification
        case optionalNotification
        case optionalNullableNotification
        case nullableSearchResult
        case optionalSearchResult
        case nullableArray
        case optionalArray
        case optionalNullableArray
        case nullableListOfNullables
        case nullableMapOfNullables
        case nullableListOfUnions
        case optionalMapOfEnums
    }
}