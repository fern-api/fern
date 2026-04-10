import Foundation

public enum V2TestCaseImplementationDescriptionBoard: Codable, Hashable, Sendable {
    case html(V2TestCaseImplementationDescriptionBoardHtml)
    case paramId(V2TestCaseImplementationDescriptionBoardParamId)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "html":
            self = .html(try V2TestCaseImplementationDescriptionBoardHtml(from: decoder))
        case "paramId":
            self = .paramId(try V2TestCaseImplementationDescriptionBoardParamId(from: decoder))
        default:
            throw DecodingError.dataCorrupted(
                DecodingError.Context(
                    codingPath: decoder.codingPath,
                    debugDescription: "Unknown shape discriminant value: \(discriminant)"
                )
            )
        }
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        switch self {
        case .html(let data):
            try container.encode("html", forKey: .type)
            try data.encode(to: encoder)
        case .paramId(let data):
            try container.encode("paramId", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}