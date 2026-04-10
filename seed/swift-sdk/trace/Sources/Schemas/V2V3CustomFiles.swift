import Foundation

public enum V2V3CustomFiles: Codable, Hashable, Sendable {
    case v2V3CustomFilesType(V2V3CustomFilesType)
    case v2V3CustomFilesZero(V2V3CustomFilesZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(V2V3CustomFilesType.self) {
            self = .v2V3CustomFilesType(value)
        } else if let value = try? container.decode(V2V3CustomFilesZero.self) {
            self = .v2V3CustomFilesZero(value)
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
        case .v2V3CustomFilesType(let value):
            try container.encode(value)
        case .v2V3CustomFilesZero(let value):
            try container.encode(value)
        }
    }
}