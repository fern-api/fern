import Foundation

/// Either a single event type or a list of event types.
public enum EventTypeParam: Codable, Hashable, Sendable {
    case eventTypeEnum(EventTypeEnum)
    case eventTypeEnumArray([EventTypeEnum])

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(EventTypeEnum.self) {
            self = .eventTypeEnum(value)
        } else if let value = try? container.decode([EventTypeEnum].self) {
            self = .eventTypeEnumArray(value)
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
        case .eventTypeEnum(let value):
            try container.encode(value)
        case .eventTypeEnumArray(let value):
            try container.encode(value)
        }
    }
}