public struct Type: Codable, Hashable {
    public let one: Int
    public let two: Double
    public let three: String
    public let four: Bool
    public let five: Int64
    public let six: Date
    public let seven: Date
    public let eight: UUID
    public let nine: String
    public let ten: [Int]
    public let eleven: Any
    public let twelve: Any
    public let thirteen: Int64?
    public let fourteen: Any
    public let fifteen: [[Int]]
    public let sixteen: [Any]
    public let seventeen: [UUID?]
    public let eighteen: Any
    public let nineteen: Name
    public let twenty: UInt
    public let twentyone: UInt64
    public let twentytwo: Float
    public let twentythree: String
    public let twentyfour: Date?
    public let twentyfive: Date?
    public let additionalProperties: [String: JSONValue]

    public init(one: Int, two: Double, three: String, four: Bool, five: Int64, six: Date, seven: Date, eight: UUID, nine: String, ten: [Int], eleven: Any, twelve: Any, thirteen: Int64? = nil, fourteen: Any, fifteen: [[Int]], sixteen: [Any], seventeen: [UUID?], eighteen: Any, nineteen: Name, twenty: UInt, twentyone: UInt64, twentytwo: Float, twentythree: String, twentyfour: Date? = nil, twentyfive: Date? = nil, additionalProperties: [String: JSONValue] = .init()) {
        self.one = one
        self.two = two
        self.three = three
        self.four = four
        self.five = five
        self.six = six
        self.seven = seven
        self.eight = eight
        self.nine = nine
        self.ten = ten
        self.eleven = eleven
        self.twelve = twelve
        self.thirteen = thirteen
        self.fourteen = fourteen
        self.fifteen = fifteen
        self.sixteen = sixteen
        self.seventeen = seventeen
        self.eighteen = eighteen
        self.nineteen = nineteen
        self.twenty = twenty
        self.twentyone = twentyone
        self.twentytwo = twentytwo
        self.twentythree = twentythree
        self.twentyfour = twentyfour
        self.twentyfive = twentyfive
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.one = try container.decode(Int.self, forKey: .one)
        self.two = try container.decode(Double.self, forKey: .two)
        self.three = try container.decode(String.self, forKey: .three)
        self.four = try container.decode(Bool.self, forKey: .four)
        self.five = try container.decode(Int64.self, forKey: .five)
        self.six = try container.decode(Date.self, forKey: .six)
        self.seven = try container.decode(Date.self, forKey: .seven)
        self.eight = try container.decode(UUID.self, forKey: .eight)
        self.nine = try container.decode(String.self, forKey: .nine)
        self.ten = try container.decode([Int].self, forKey: .ten)
        self.eleven = try container.decode(Any.self, forKey: .eleven)
        self.twelve = try container.decode(Any.self, forKey: .twelve)
        self.thirteen = try container.decodeIfPresent(Int64.self, forKey: .thirteen)
        self.fourteen = try container.decode(Any.self, forKey: .fourteen)
        self.fifteen = try container.decode([[Int]].self, forKey: .fifteen)
        self.sixteen = try container.decode([Any].self, forKey: .sixteen)
        self.seventeen = try container.decode([UUID?].self, forKey: .seventeen)
        self.eighteen = try container.decode(Any.self, forKey: .eighteen)
        self.nineteen = try container.decode(Name.self, forKey: .nineteen)
        self.twenty = try container.decode(UInt.self, forKey: .twenty)
        self.twentyone = try container.decode(UInt64.self, forKey: .twentyone)
        self.twentytwo = try container.decode(Float.self, forKey: .twentytwo)
        self.twentythree = try container.decode(String.self, forKey: .twentythree)
        self.twentyfour = try container.decodeIfPresent(Date.self, forKey: .twentyfour)
        self.twentyfive = try container.decodeIfPresent(Date.self, forKey: .twentyfive)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.one, forKey: .one)
        try container.encode(self.two, forKey: .two)
        try container.encode(self.three, forKey: .three)
        try container.encode(self.four, forKey: .four)
        try container.encode(self.five, forKey: .five)
        try container.encode(self.six, forKey: .six)
        try container.encode(self.seven, forKey: .seven)
        try container.encode(self.eight, forKey: .eight)
        try container.encode(self.nine, forKey: .nine)
        try container.encode(self.ten, forKey: .ten)
        try container.encode(self.eleven, forKey: .eleven)
        try container.encode(self.twelve, forKey: .twelve)
        try container.encodeIfPresent(self.thirteen, forKey: .thirteen)
        try container.encode(self.fourteen, forKey: .fourteen)
        try container.encode(self.fifteen, forKey: .fifteen)
        try container.encode(self.sixteen, forKey: .sixteen)
        try container.encode(self.seventeen, forKey: .seventeen)
        try container.encode(self.eighteen, forKey: .eighteen)
        try container.encode(self.nineteen, forKey: .nineteen)
        try container.encode(self.twenty, forKey: .twenty)
        try container.encode(self.twentyone, forKey: .twentyone)
        try container.encode(self.twentytwo, forKey: .twentytwo)
        try container.encode(self.twentythree, forKey: .twentythree)
        try container.encodeIfPresent(self.twentyfour, forKey: .twentyfour)
        try container.encodeIfPresent(self.twentyfive, forKey: .twentyfive)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case one
        case two
        case three
        case four
        case five
        case six
        case seven
        case eight
        case nine
        case ten
        case eleven
        case twelve
        case thirteen
        case fourteen
        case fifteen
        case sixteen
        case seventeen
        case eighteen
        case nineteen
        case twenty
        case twentyone
        case twentytwo
        case twentythree
        case twentyfour
        case twentyfive
    }
}