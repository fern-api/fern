import Foundation

/// Test object with nullable enums, unions, and arrays
public struct ComplexProfile: Codable, Hashable, Sendable {
    public let id: String
    public let nullableRole: UserRole?
    public let optionalRole: UserRole?
    public let optionalNullableRole: UserRole?
    public let nullableStatus: UserStatus?
    public let optionalStatus: UserStatus?
    public let optionalNullableStatus: UserStatus?
    public let nullableNotification: NotificationMethod?
    public let optionalNotification: NotificationMethod?
    public let optionalNullableNotification: NotificationMethod?
    public let nullableSearchResult: SearchResult?
    public let optionalSearchResult: SearchResult?
    public let nullableArray: [String]?
    public let optionalArray: [String]?
    public let optionalNullableArray: [String]?
    public let nullableListOfNullables: [String?]?
    public let nullableMapOfNullables: [String: Address?]?
    public let nullableListOfUnions: [NotificationMethod]?
    public let optionalMapOfEnums: [String: UserRole]?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        id: String,
        nullableRole: UserRole? = nil,
        optionalRole: UserRole? = nil,
        optionalNullableRole: UserRole? = nil,
        nullableStatus: UserStatus? = nil,
        optionalStatus: UserStatus? = nil,
        optionalNullableStatus: UserStatus? = nil,
        nullableNotification: NotificationMethod? = nil,
        optionalNotification: NotificationMethod? = nil,
        optionalNullableNotification: NotificationMethod? = nil,
        nullableSearchResult: SearchResult? = nil,
        optionalSearchResult: SearchResult? = nil,
        nullableArray: [String]? = nil,
        optionalArray: [String]? = nil,
        optionalNullableArray: [String]? = nil,
        nullableListOfNullables: [String?]? = nil,
        nullableMapOfNullables: [String: Address?]? = nil,
        nullableListOfUnions: [NotificationMethod]? = nil,
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
        self.nullableRole = try container.decodeIfPresent(UserRole.self, forKey: .nullableRole)
        self.optionalRole = try container.decodeIfPresent(UserRole.self, forKey: .optionalRole)
        self.optionalNullableRole = try container.decodeIfPresent(UserRole.self, forKey: .optionalNullableRole)
        self.nullableStatus = try container.decodeIfPresent(UserStatus.self, forKey: .nullableStatus)
        self.optionalStatus = try container.decodeIfPresent(UserStatus.self, forKey: .optionalStatus)
        self.optionalNullableStatus = try container.decodeIfPresent(UserStatus.self, forKey: .optionalNullableStatus)
        self.nullableNotification = try container.decodeIfPresent(NotificationMethod.self, forKey: .nullableNotification)
        self.optionalNotification = try container.decodeIfPresent(NotificationMethod.self, forKey: .optionalNotification)
        self.optionalNullableNotification = try container.decodeIfPresent(NotificationMethod.self, forKey: .optionalNullableNotification)
        self.nullableSearchResult = try container.decodeIfPresent(SearchResult.self, forKey: .nullableSearchResult)
        self.optionalSearchResult = try container.decodeIfPresent(SearchResult.self, forKey: .optionalSearchResult)
        self.nullableArray = try container.decodeIfPresent([String].self, forKey: .nullableArray)
        self.optionalArray = try container.decodeIfPresent([String].self, forKey: .optionalArray)
        self.optionalNullableArray = try container.decodeIfPresent([String].self, forKey: .optionalNullableArray)
        self.nullableListOfNullables = try container.decodeIfPresent([String?].self, forKey: .nullableListOfNullables)
        self.nullableMapOfNullables = try container.decodeIfPresent([String: Address?].self, forKey: .nullableMapOfNullables)
        self.nullableListOfUnions = try container.decodeIfPresent([NotificationMethod].self, forKey: .nullableListOfUnions)
        self.optionalMapOfEnums = try container.decodeIfPresent([String: UserRole].self, forKey: .optionalMapOfEnums)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.id, forKey: .id)
        try container.encodeIfPresent(self.nullableRole, forKey: .nullableRole)
        try container.encodeIfPresent(self.optionalRole, forKey: .optionalRole)
        try container.encodeIfPresent(self.optionalNullableRole, forKey: .optionalNullableRole)
        try container.encodeIfPresent(self.nullableStatus, forKey: .nullableStatus)
        try container.encodeIfPresent(self.optionalStatus, forKey: .optionalStatus)
        try container.encodeIfPresent(self.optionalNullableStatus, forKey: .optionalNullableStatus)
        try container.encodeIfPresent(self.nullableNotification, forKey: .nullableNotification)
        try container.encodeIfPresent(self.optionalNotification, forKey: .optionalNotification)
        try container.encodeIfPresent(self.optionalNullableNotification, forKey: .optionalNullableNotification)
        try container.encodeIfPresent(self.nullableSearchResult, forKey: .nullableSearchResult)
        try container.encodeIfPresent(self.optionalSearchResult, forKey: .optionalSearchResult)
        try container.encodeIfPresent(self.nullableArray, forKey: .nullableArray)
        try container.encodeIfPresent(self.optionalArray, forKey: .optionalArray)
        try container.encodeIfPresent(self.optionalNullableArray, forKey: .optionalNullableArray)
        try container.encodeIfPresent(self.nullableListOfNullables, forKey: .nullableListOfNullables)
        try container.encodeIfPresent(self.nullableMapOfNullables, forKey: .nullableMapOfNullables)
        try container.encodeIfPresent(self.nullableListOfUnions, forKey: .nullableListOfUnions)
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