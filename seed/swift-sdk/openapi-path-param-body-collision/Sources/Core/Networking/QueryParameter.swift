import Foundation

enum QueryParameter {
    case string(Swift.String)
    case bool(Swift.Bool)
    case int(Swift.Int)
    case uint(Swift.UInt)
    case uint64(Swift.UInt64)
    case int64(Swift.Int64)
    case float(Swift.Float)
    case double(Swift.Double)
    case date(Foundation.Date)
    case calendarDate(CalendarDate)
    case stringArray([Swift.String])
    case uuid(Foundation.UUID)
    case unknown(Any)

    func toString() -> Swift.String {
        switch self {
        case .string(let value):
            return value
        case .bool(let value):
            return value ? "true" : "false"
        case .int(let value):
            return Swift.String(value)
        case .uint(let value):
            return Swift.String(value)
        case .uint64(let value):
            return Swift.String(value)
        case .int64(let value):
            return Swift.String(value)
        case .float(let value):
            return Swift.String(value)
        case .double(let value):
            return Swift.String(value)
        case .date(let value):
            return value.ISO8601Format()
        case .calendarDate(let value):
            return value.description
        case .stringArray(let values):
            return values.joined(separator: ",")
        case .uuid(let value):
            return value.uuidString
        case .unknown:
            return ""
        }
    }
}
