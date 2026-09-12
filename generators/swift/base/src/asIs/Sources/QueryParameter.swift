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

    /// The query items this parameter contributes to the request url.
    ///
    /// Every case except `.unknown` produces a single item under the parameter's own name.
    /// An `.unknown` value that is a dictionary - a map typed query parameter - is exploded:
    /// every entry becomes its own item, keyed by the property name alone, and only nested
    /// levels stay bracketed. Any other `.unknown` value keeps the existing behavior of
    /// contributing nothing.
    func toQueryItems(name: Swift.String) -> [Foundation.URLQueryItem] {
        switch self {
        case .unknown(let value):
            guard let object = value as? [Swift.String: Any] else { return [] }
            return Self.explodedQueryItems(object, scope: nil)
        default:
            let stringValue = toString()
            guard !stringValue.isEmpty else { return [] }
            return [Foundation.URLQueryItem(name: name, value: stringValue)]
        }
    }

    private static func explodedQueryItems(
        _ object: [Swift.String: Any], scope: Swift.String?
    ) -> [Foundation.URLQueryItem] {
        var items: [Foundation.URLQueryItem] = []
        for (key, value) in object.sorted(by: { $0.key < $1.key }) {
            let name = scope.map { "\($0)[\(key)]" } ?? key
            if let json = value as? JSONValue {
                items.append(contentsOf: explodedQueryItems(json, name: name))
            } else if let nested = value as? [Swift.String: Any] {
                items.append(contentsOf: explodedQueryItems(nested, scope: name))
            } else if let stringValue = stringifyExplodedValue(value) {
                items.append(Foundation.URLQueryItem(name: name, value: stringValue))
            }
        }
        return items
    }

    private static func explodedQueryItems(
        _ json: JSONValue, name: Swift.String
    ) -> [Foundation.URLQueryItem] {
        switch json {
        case .null:
            return []
        case .object(let object):
            var items: [Foundation.URLQueryItem] = []
            for (key, value) in object.sorted(by: { $0.key < $1.key }) {
                items.append(contentsOf: explodedQueryItems(value, name: "\(name)[\(key)]"))
            }
            return items
        case .array(let array):
            let joined = array.compactMap(stringifyScalarJSONValue).joined(separator: ",")
            return joined.isEmpty ? [] : [Foundation.URLQueryItem(name: name, value: joined)]
        default:
            guard let stringValue = stringifyScalarJSONValue(json) else { return [] }
            return [Foundation.URLQueryItem(name: name, value: stringValue)]
        }
    }

    private static func stringifyScalarJSONValue(_ json: JSONValue) -> Swift.String? {
        switch json {
        case .string(let string):
            return string
        case .number(let number):
            return stringifyDouble(number)
        case .bool(let bool):
            return bool ? "true" : "false"
        case .null, .array, .object:
            return nil
        }
    }

    private static func stringifyExplodedValue(_ value: Any) -> Swift.String? {
        // An exact check for Bool comes first: on Apple platforms `as?` bridges through
        // NSNumber, which would happily read an Int as a Bool and vice versa.
        if type(of: value) is Swift.Bool.Type {
            return (value as? Swift.Bool).map { $0 ? "true" : "false" }
        }
        switch value {
        case let string as Swift.String:
            return string
        case let int as Swift.Int:
            return Swift.String(int)
        case let int64 as Swift.Int64:
            return Swift.String(int64)
        case let uint as Swift.UInt:
            return Swift.String(uint)
        case let uint64 as Swift.UInt64:
            return Swift.String(uint64)
        case let double as Swift.Double:
            return stringifyDouble(double)
        case let float as Swift.Float:
            return Swift.String(float)
        case let date as Foundation.Date:
            return date.ISO8601Format()
        case let calendarDate as CalendarDate:
            return calendarDate.description
        case let uuid as Foundation.UUID:
            return uuid.uuidString
        case let array as [Any]:
            let joined = array.compactMap(stringifyExplodedValue).joined(separator: ",")
            return joined.isEmpty ? nil : joined
        default:
            return nil
        }
    }

    private static func stringifyDouble(_ double: Swift.Double) -> Swift.String {
        if double == double.rounded(), let int64 = Swift.Int64(exactly: double) {
            return Swift.String(int64)
        }
        return Swift.String(double)
    }
}
