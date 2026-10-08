import Foundation

public struct TreeRecord: Codable, Hashable, Sendable {
    /// Unique tree identifier.
    public let id: String
    /// Display name of the tree.
    public let treeName: String
    /// The species of tree.
    public let treeSpecies: String
    /// Date the tree was planted.
    public let plantedDate: CalendarDate?
    /// Height of the tree in feet.
    public let heightInFeet: Double?
    /// A description of the tree.
    public let treeDescription: String?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        id: String,
        treeName: String,
        treeSpecies: String,
        plantedDate: CalendarDate? = nil,
        heightInFeet: Double? = nil,
        treeDescription: String? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.id = id
        self.treeName = treeName
        self.treeSpecies = treeSpecies
        self.plantedDate = plantedDate
        self.heightInFeet = heightInFeet
        self.treeDescription = treeDescription
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(String.self, forKey: .id)
        self.treeName = try container.decode(String.self, forKey: .treeName)
        self.treeSpecies = try container.decode(String.self, forKey: .treeSpecies)
        self.plantedDate = try container.decodeIfPresent(CalendarDate.self, forKey: .plantedDate)
        self.heightInFeet = try container.decodeIfPresent(Double.self, forKey: .heightInFeet)
        self.treeDescription = try container.decodeIfPresent(String.self, forKey: .treeDescription)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.id, forKey: .id)
        try container.encode(self.treeName, forKey: .treeName)
        try container.encode(self.treeSpecies, forKey: .treeSpecies)
        try container.encodeIfPresent(self.plantedDate, forKey: .plantedDate)
        try container.encodeIfPresent(self.heightInFeet, forKey: .heightInFeet)
        try container.encodeIfPresent(self.treeDescription, forKey: .treeDescription)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case id
        case treeName
        case treeSpecies
        case plantedDate
        case heightInFeet
        case treeDescription
    }
}