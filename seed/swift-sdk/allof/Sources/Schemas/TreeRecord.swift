import Foundation

public struct TreeRecord: Codable, Hashable, Sendable {
    /// The species of tree.
    public let treeSpecies: String?
    /// Height of the tree in feet.
    public let heightInFeet: Double?
    /// Unique tree identifier.
    public let id: String
    /// Display name of the tree.
    public let treeName: String?
    /// A description of the tree.
    public let treeDescription: String?
    /// Date the tree was planted.
    public let plantedDate: CalendarDate?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        treeSpecies: String? = nil,
        heightInFeet: Double? = nil,
        id: String,
        treeName: String? = nil,
        treeDescription: String? = nil,
        plantedDate: CalendarDate? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.treeSpecies = treeSpecies
        self.heightInFeet = heightInFeet
        self.id = id
        self.treeName = treeName
        self.treeDescription = treeDescription
        self.plantedDate = plantedDate
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.treeSpecies = try container.decodeIfPresent(String.self, forKey: .treeSpecies)
        self.heightInFeet = try container.decodeIfPresent(Double.self, forKey: .heightInFeet)
        self.id = try container.decode(String.self, forKey: .id)
        self.treeName = try container.decodeIfPresent(String.self, forKey: .treeName)
        self.treeDescription = try container.decodeIfPresent(String.self, forKey: .treeDescription)
        self.plantedDate = try container.decodeIfPresent(CalendarDate.self, forKey: .plantedDate)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.treeSpecies, forKey: .treeSpecies)
        try container.encodeIfPresent(self.heightInFeet, forKey: .heightInFeet)
        try container.encode(self.id, forKey: .id)
        try container.encodeIfPresent(self.treeName, forKey: .treeName)
        try container.encodeIfPresent(self.treeDescription, forKey: .treeDescription)
        try container.encodeIfPresent(self.plantedDate, forKey: .plantedDate)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case treeSpecies
        case heightInFeet
        case id
        case treeName
        case treeDescription
        case plantedDate
    }
}