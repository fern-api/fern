import Foundation

public enum V2CustomFiles: Codable, Hashable, Sendable {
    case v2CustomFilesType(V2CustomFilesType)
    case v2CustomFilesZero(V2CustomFilesZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(V2CustomFilesType.self) {
            self = .v2CustomFilesType(value)
        } else if let value = try? container.decode(V2CustomFilesZero.self) {
            self = .v2CustomFilesZero(value)
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
        case .v2CustomFilesType(let value):
            try container.encode(value)
        case .v2CustomFilesZero(let value):
            try container.encode(value)
        }
    }
}