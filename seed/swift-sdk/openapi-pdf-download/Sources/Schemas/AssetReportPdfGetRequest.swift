import Foundation

public struct AssetReportPdfGetRequest: Codable, Hashable, Sendable {
    public let assetReportToken: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        assetReportToken: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.assetReportToken = assetReportToken
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.assetReportToken = try container.decode(String.self, forKey: .assetReportToken)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.assetReportToken, forKey: .assetReportToken)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case assetReportToken = "asset_report_token"
    }
}