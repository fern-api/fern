import Foundation

public struct Vendor: Codable, Hashable, Sendable {
    public let id: String
    public let name: String
    public let status: VendorStatus?
    public let updateRequest: UpdateVendorRequest?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        id: String,
        name: String,
        status: VendorStatus? = nil,
        updateRequest: UpdateVendorRequest? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.id = id
        self.name = name
        self.status = status
        self.updateRequest = updateRequest
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(String.self, forKey: .id)
        self.name = try container.decode(String.self, forKey: .name)
        self.status = try container.decodeIfPresent(VendorStatus.self, forKey: .status)
        self.updateRequest = try container.decodeIfPresent(UpdateVendorRequest.self, forKey: .updateRequest)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.id, forKey: .id)
        try container.encode(self.name, forKey: .name)
        try container.encodeIfPresent(self.status, forKey: .status)
        try container.encodeIfPresent(self.updateRequest, forKey: .updateRequest)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case id
        case name
        case status
        case updateRequest = "update_request"
    }
}