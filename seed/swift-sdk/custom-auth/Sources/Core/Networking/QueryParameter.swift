import Foundation

enum QueryParameter {
    case string(String)
    case bool(Bool)
    case int(Int)
    case uint(UInt)
    case uint64(UInt64)
    case int64(Int64)
    case float(Float)
    case double(Double)
    case date(Date)
    case calendarDate(CalendarDate)
    case stringArray([String])
    case uuid(UUID)
    case unknown(Any)

    func toString() -> String {
        switch self {
        case .string(let value):
            return value
        case .bool(let value):
            return value ? "true" : "false"
        case .int(let value):
            return String(value)
        case .uint(let value):
            return String(value)
        case .uint64(let value):
            return String(value)
        case .int64(let value):
            return String(value)
        case .float(let value):
            return String(value)
        case .double(let value):
            return String(value)
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
