import Foundation

public enum BigUnion: Codable, Hashable, Sendable {
    case bigUnionEight(BigUnionEight)
    case bigUnionEighteen(BigUnionEighteen)
    case bigUnionEleven(BigUnionEleven)
    case bigUnionFifteen(BigUnionFifteen)
    case bigUnionFive(BigUnionFive)
    case bigUnionFour(BigUnionFour)
    case bigUnionFourteen(BigUnionFourteen)
    case bigUnionNine(BigUnionNine)
    case bigUnionNineteen(BigUnionNineteen)
    case bigUnionOne(BigUnionOne)
    case bigUnionSeven(BigUnionSeven)
    case bigUnionSeventeen(BigUnionSeventeen)
    case bigUnionSix(BigUnionSix)
    case bigUnionSixteen(BigUnionSixteen)
    case bigUnionTen(BigUnionTen)
    case bigUnionThirteen(BigUnionThirteen)
    case bigUnionThree(BigUnionThree)
    case bigUnionTwelve(BigUnionTwelve)
    case bigUnionTwenty(BigUnionTwenty)
    case bigUnionTwentyEight(BigUnionTwentyEight)
    case bigUnionTwentyFive(BigUnionTwentyFive)
    case bigUnionTwentyFour(BigUnionTwentyFour)
    case bigUnionTwentyOne(BigUnionTwentyOne)
    case bigUnionTwentySeven(BigUnionTwentySeven)
    case bigUnionTwentySix(BigUnionTwentySix)
    case bigUnionTwentyThree(BigUnionTwentyThree)
    case bigUnionTwentyTwo(BigUnionTwentyTwo)
    case bigUnionTwo(BigUnionTwo)
    case bigUnionZero(BigUnionZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(BigUnionEight.self) {
            self = .bigUnionEight(value)
        } else if let value = try? container.decode(BigUnionEighteen.self) {
            self = .bigUnionEighteen(value)
        } else if let value = try? container.decode(BigUnionEleven.self) {
            self = .bigUnionEleven(value)
        } else if let value = try? container.decode(BigUnionFifteen.self) {
            self = .bigUnionFifteen(value)
        } else if let value = try? container.decode(BigUnionFive.self) {
            self = .bigUnionFive(value)
        } else if let value = try? container.decode(BigUnionFour.self) {
            self = .bigUnionFour(value)
        } else if let value = try? container.decode(BigUnionFourteen.self) {
            self = .bigUnionFourteen(value)
        } else if let value = try? container.decode(BigUnionNine.self) {
            self = .bigUnionNine(value)
        } else if let value = try? container.decode(BigUnionNineteen.self) {
            self = .bigUnionNineteen(value)
        } else if let value = try? container.decode(BigUnionOne.self) {
            self = .bigUnionOne(value)
        } else if let value = try? container.decode(BigUnionSeven.self) {
            self = .bigUnionSeven(value)
        } else if let value = try? container.decode(BigUnionSeventeen.self) {
            self = .bigUnionSeventeen(value)
        } else if let value = try? container.decode(BigUnionSix.self) {
            self = .bigUnionSix(value)
        } else if let value = try? container.decode(BigUnionSixteen.self) {
            self = .bigUnionSixteen(value)
        } else if let value = try? container.decode(BigUnionTen.self) {
            self = .bigUnionTen(value)
        } else if let value = try? container.decode(BigUnionThirteen.self) {
            self = .bigUnionThirteen(value)
        } else if let value = try? container.decode(BigUnionThree.self) {
            self = .bigUnionThree(value)
        } else if let value = try? container.decode(BigUnionTwelve.self) {
            self = .bigUnionTwelve(value)
        } else if let value = try? container.decode(BigUnionTwenty.self) {
            self = .bigUnionTwenty(value)
        } else if let value = try? container.decode(BigUnionTwentyEight.self) {
            self = .bigUnionTwentyEight(value)
        } else if let value = try? container.decode(BigUnionTwentyFive.self) {
            self = .bigUnionTwentyFive(value)
        } else if let value = try? container.decode(BigUnionTwentyFour.self) {
            self = .bigUnionTwentyFour(value)
        } else if let value = try? container.decode(BigUnionTwentyOne.self) {
            self = .bigUnionTwentyOne(value)
        } else if let value = try? container.decode(BigUnionTwentySeven.self) {
            self = .bigUnionTwentySeven(value)
        } else if let value = try? container.decode(BigUnionTwentySix.self) {
            self = .bigUnionTwentySix(value)
        } else if let value = try? container.decode(BigUnionTwentyThree.self) {
            self = .bigUnionTwentyThree(value)
        } else if let value = try? container.decode(BigUnionTwentyTwo.self) {
            self = .bigUnionTwentyTwo(value)
        } else if let value = try? container.decode(BigUnionTwo.self) {
            self = .bigUnionTwo(value)
        } else if let value = try? container.decode(BigUnionZero.self) {
            self = .bigUnionZero(value)
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
        case .bigUnionEight(let value):
            try container.encode(value)
        case .bigUnionEighteen(let value):
            try container.encode(value)
        case .bigUnionEleven(let value):
            try container.encode(value)
        case .bigUnionFifteen(let value):
            try container.encode(value)
        case .bigUnionFive(let value):
            try container.encode(value)
        case .bigUnionFour(let value):
            try container.encode(value)
        case .bigUnionFourteen(let value):
            try container.encode(value)
        case .bigUnionNine(let value):
            try container.encode(value)
        case .bigUnionNineteen(let value):
            try container.encode(value)
        case .bigUnionOne(let value):
            try container.encode(value)
        case .bigUnionSeven(let value):
            try container.encode(value)
        case .bigUnionSeventeen(let value):
            try container.encode(value)
        case .bigUnionSix(let value):
            try container.encode(value)
        case .bigUnionSixteen(let value):
            try container.encode(value)
        case .bigUnionTen(let value):
            try container.encode(value)
        case .bigUnionThirteen(let value):
            try container.encode(value)
        case .bigUnionThree(let value):
            try container.encode(value)
        case .bigUnionTwelve(let value):
            try container.encode(value)
        case .bigUnionTwenty(let value):
            try container.encode(value)
        case .bigUnionTwentyEight(let value):
            try container.encode(value)
        case .bigUnionTwentyFive(let value):
            try container.encode(value)
        case .bigUnionTwentyFour(let value):
            try container.encode(value)
        case .bigUnionTwentyOne(let value):
            try container.encode(value)
        case .bigUnionTwentySeven(let value):
            try container.encode(value)
        case .bigUnionTwentySix(let value):
            try container.encode(value)
        case .bigUnionTwentyThree(let value):
            try container.encode(value)
        case .bigUnionTwentyTwo(let value):
            try container.encode(value)
        case .bigUnionTwo(let value):
            try container.encode(value)
        case .bigUnionZero(let value):
            try container.encode(value)
        }
    }
}