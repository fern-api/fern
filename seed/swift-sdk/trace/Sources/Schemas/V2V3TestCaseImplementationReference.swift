import Foundation

public enum V2V3TestCaseImplementationReference: Codable, Hashable, Sendable {
    case v2V3TestCaseImplementationReferenceOne(V2V3TestCaseImplementationReferenceOne)
    case v2V3TestCaseImplementationReferenceType(V2V3TestCaseImplementationReferenceType)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(V2V3TestCaseImplementationReferenceOne.self) {
            self = .v2V3TestCaseImplementationReferenceOne(value)
        } else if let value = try? container.decode(V2V3TestCaseImplementationReferenceType.self) {
            self = .v2V3TestCaseImplementationReferenceType(value)
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
        case .v2V3TestCaseImplementationReferenceOne(let value):
            try container.encode(value)
        case .v2V3TestCaseImplementationReferenceType(let value):
            try container.encode(value)
        }
    }
}