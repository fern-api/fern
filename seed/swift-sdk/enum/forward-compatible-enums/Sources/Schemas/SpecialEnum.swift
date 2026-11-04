import Foundation

public enum SpecialEnum: RawRepresentable, Codable, Hashable, CaseIterable, Sendable {
    case a
    case b
    case c
    case d
    case e
    case f
    case h
    case i
    case j
    case k
    case l
    case m
    case n
    case o
    case p
    case q
    case r
    case s
    case t
    case u
    case v
    case w
    case x
    case y
    case z
    case aa
    case bb
    case cc
    case dd
    case ee
    case ff
    case gg
    /// A value this version of the SDK does not recognize, such as one the API added later.
    case __unknown(String)

    public static let allCases: [Self] = [.a, .b, .c, .d, .e, .f, .h, .i, .j, .k, .l, .m, .n, .o, .p, .q, .r, .s, .t, .u, .v, .w, .x, .y, .z, .aa, .bb, .cc, .dd, .ee, .ff, .gg]

    public init(rawValue: String) {
        switch rawValue {
        case "": self = .a
        case "Hello \\\"World\\\"": self = .b
        case "Hello 'World'": self = .c
        case "Hello\\\\World": self = .d
        case "Hello\\nWorld": self = .e
        case "Hello\\rWorld": self = .f
        case "Hello\\tWorld": self = .h
        case "Hello\\fWorld": self = .i
        case "Hello\\u0008World": self = .j
        case "Hello\\vWorld": self = .k
        case "Hello\\x00World": self = .l
        case "Hello\\u0007World": self = .m
        case "Hello\\u0001World": self = .n
        case "Hello\\u0002World": self = .o
        case "Hello\\u001FWorld": self = .p
        case "Hello\\u007FWorld": self = .q
        case "Hello\\u009FWorld": self = .r
        case "Line 1\\n\"Quote\"\\tTab\\\\Backslash\\r\\nLine 2\\0Null": self = .s
        case "\\n\\r\\t\\x00\\u0008\\f\\v\\u0007": self = .t
        case "Hello 世界": self = .u
        case "café": self = .v
        case "🚀": self = .w
        case "\\\\n": self = .x
        case "\\\\": self = .y
        case "{\"name\": \"John\", \"age\": 30, \"city\": \"New York\"}": self = .z
        case "SELECT * FROM users WHERE name = 'John O\\\\'Reilly'": self = .aa
        case "C:\\\\Users\\\\John\\\\Documents\\\\file.txt": self = .bb
        case "/usr/local/bin/app": self = .cc
        case "\\\\d{3}-\\\\d{2}-\\\\d{4}": self = .dd
        case "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}": self = .ee
        case "transcript[transcriptType=\"final\"]": self = .ff
        case "transcript[transcriptType='final']": self = .gg
        default: self = .__unknown(rawValue)
        }
    }

    public var rawValue: String {
        switch self {
        case .a: return ""
        case .b: return "Hello \\\"World\\\""
        case .c: return "Hello 'World'"
        case .d: return "Hello\\\\World"
        case .e: return "Hello\\nWorld"
        case .f: return "Hello\\rWorld"
        case .h: return "Hello\\tWorld"
        case .i: return "Hello\\fWorld"
        case .j: return "Hello\\u0008World"
        case .k: return "Hello\\vWorld"
        case .l: return "Hello\\x00World"
        case .m: return "Hello\\u0007World"
        case .n: return "Hello\\u0001World"
        case .o: return "Hello\\u0002World"
        case .p: return "Hello\\u001FWorld"
        case .q: return "Hello\\u007FWorld"
        case .r: return "Hello\\u009FWorld"
        case .s: return "Line 1\\n\"Quote\"\\tTab\\\\Backslash\\r\\nLine 2\\0Null"
        case .t: return "\\n\\r\\t\\x00\\u0008\\f\\v\\u0007"
        case .u: return "Hello 世界"
        case .v: return "café"
        case .w: return "🚀"
        case .x: return "\\\\n"
        case .y: return "\\\\"
        case .z: return "{\"name\": \"John\", \"age\": 30, \"city\": \"New York\"}"
        case .aa: return "SELECT * FROM users WHERE name = 'John O\\\\'Reilly'"
        case .bb: return "C:\\\\Users\\\\John\\\\Documents\\\\file.txt"
        case .cc: return "/usr/local/bin/app"
        case .dd: return "\\\\d{3}-\\\\d{2}-\\\\d{4}"
        case .ee: return "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}"
        case .ff: return "transcript[transcriptType=\"final\"]"
        case .gg: return "transcript[transcriptType='final']"
        case .__unknown(let rawValue): return rawValue
        }
    }

    public init(from decoder: Decoder) throws {
        self.init(rawValue: try decoder.singleValueContainer().decode(String.self))
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        try container.encode(rawValue)
    }
}