import Foundation

public enum UploadDocumentResponse: Codable, Hashable, Sendable {
    case documentMetadata(DocumentMetadata)
    case documentUploadResult(DocumentUploadResult)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(DocumentMetadata.self) {
            self = .documentMetadata(value)
        } else if let value = try? container.decode(DocumentUploadResult.self) {
            self = .documentUploadResult(value)
        } else {
            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Unexpected value."
            )
        }
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.singleValueContainer()
        switch self {
        case .documentMetadata(let value):
            try container.encode(value)
        case .documentUploadResult(let value):
            try container.encode(value)
        }
    }
}