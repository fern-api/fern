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
    /// An `.unknown` value that encodes to a JSON object - a map typed query parameter - is
    /// exploded: every entry becomes its own item, keyed by the property name alone, nested
    /// objects stay bracketed and arrays repeat the name. The map goes through the same
    /// encoder as a request body, so enums, dates and declared objects keep their wire form.
    /// Any other `.unknown` value keeps the existing behavior of contributing nothing.
    func toQueryItems(name: Swift.String) -> [Foundation.URLQueryItem] {
        switch self {
        case .unknown(let value):
            guard let encodable = value as? any Swift.Encodable,
                let data = try? Serde.jsonEncoder.encode(value: EncodableValue(encodable)),
                case .object(let object)? = try? Serde.jsonDecoder.decode(JSONValue.self, from: data)
            else { return [] }
            return object.sorted(by: { $0.key < $1.key }).flatMap { key, value in
                Self.explodedQueryItems(value, name: key)
            }
        default:
            let stringValue = toString()
            guard !stringValue.isEmpty else { return [] }
            return [Foundation.URLQueryItem(name: name, value: stringValue)]
        }
    }

    private static func explodedQueryItems(
        _ json: JSONValue, name: Swift.String
    ) -> [Foundation.URLQueryItem] {
        switch json {
        case .null:
            return []
        case .string(let string):
            return [Foundation.URLQueryItem(name: name, value: string)]
        case .bool(let bool):
            return [Foundation.URLQueryItem(name: name, value: bool ? "true" : "false")]
        case .number(let number):
            // JSON has one number type, so an integer map value arrives as a Double here:
            // print integral values without a fraction so that 25 stays 25.
            let isIntegral = number == number.rounded() && Swift.Int64(exactly: number) != nil
            let stringValue = isIntegral ? Swift.String(Swift.Int64(number)) : Swift.String(number)
            return [Foundation.URLQueryItem(name: name, value: stringValue)]
        case .array(let items):
            return items.flatMap { explodedQueryItems($0, name: name) }
        case .object(let object):
            return object.sorted(by: { $0.key < $1.key }).flatMap { key, value in
                explodedQueryItems(value, name: "\(name)[\(key)]")
            }
        }
    }
}
