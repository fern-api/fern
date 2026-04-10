import Foundation

public enum V2TestCaseImplementationReference: Codable, Hashable, Sendable {
    case v2TestCaseImplementationReferenceOne(V2TestCaseImplementationReferenceOne)
    case v2TestCaseImplementationReferenceType(V2TestCaseImplementationReferenceType)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(V2TestCaseImplementationReferenceOne.self) {
            self = .v2TestCaseImplementationReferenceOne(value)
        } else if let value = try? container.decode(V2TestCaseImplementationReferenceType.self) {
            self = .v2TestCaseImplementationReferenceType(value)
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
        case .v2TestCaseImplementationReferenceOne(let value):
            try container.encode(value)
        case .v2TestCaseImplementationReferenceType(let value):
            try container.encode(value)
        }
    }
}