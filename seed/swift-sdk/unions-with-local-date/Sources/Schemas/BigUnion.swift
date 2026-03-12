import Foundation

public enum BigUnion: Codable, Hashable, Sendable {
    case activeDiamond(ActiveDiamond)
    case attractiveScript(AttractiveScript)
    case circularCard(CircularCard)
    case colorfulCover(ColorfulCover)
    case diligentDeal(DiligentDeal)
    case disloyalValue(DisloyalValue)
    case distinctFailure(DistinctFailure)
    case falseMirror(FalseMirror)
    case frozenSleep(FrozenSleep)
    case gaseousRoad(GaseousRoad)
    case gruesomeCoach(GruesomeCoach)
    case harmoniousPlay(HarmoniousPlay)
    case hastyPain(HastyPain)
    case hoarseMouse(HoarseMouse)
    case jumboEnd(JumboEnd)
    case limpingStep(LimpingStep)
    case mistySnow(MistySnow)
    case normalSweet(NormalSweet)
    case popularLimit(PopularLimit)
    case potableBad(PotableBad)
    case practicalPrinciple(PracticalPrinciple)
    case primaryBlock(PrimaryBlock)
    case rotatingRatio(RotatingRatio)
    case thankfulFactor(ThankfulFactor)
    case totalWork(TotalWork)
    case triangularRepair(TriangularRepair)
    case uniqueStress(UniqueStress)
    case unwillingSmoke(UnwillingSmoke)
    case vibrantExcitement(VibrantExcitement)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "activeDiamond":
            self = .activeDiamond(try ActiveDiamond(from: decoder))
        case "attractiveScript":
            self = .attractiveScript(try AttractiveScript(from: decoder))
        case "circularCard":
            self = .circularCard(try CircularCard(from: decoder))
        case "colorfulCover":
            self = .colorfulCover(try ColorfulCover(from: decoder))
        case "diligentDeal":
            self = .diligentDeal(try DiligentDeal(from: decoder))
        case "disloyalValue":
            self = .disloyalValue(try DisloyalValue(from: decoder))
        case "distinctFailure":
            self = .distinctFailure(try DistinctFailure(from: decoder))
        case "falseMirror":
            self = .falseMirror(try FalseMirror(from: decoder))
        case "frozenSleep":
            self = .frozenSleep(try FrozenSleep(from: decoder))
        case "gaseousRoad":
            self = .gaseousRoad(try GaseousRoad(from: decoder))
        case "gruesomeCoach":
            self = .gruesomeCoach(try GruesomeCoach(from: decoder))
        case "harmoniousPlay":
            self = .harmoniousPlay(try HarmoniousPlay(from: decoder))
        case "hastyPain":
            self = .hastyPain(try HastyPain(from: decoder))
        case "hoarseMouse":
            self = .hoarseMouse(try HoarseMouse(from: decoder))
        case "jumboEnd":
            self = .jumboEnd(try JumboEnd(from: decoder))
        case "limpingStep":
            self = .limpingStep(try LimpingStep(from: decoder))
        case "mistySnow":
            self = .mistySnow(try MistySnow(from: decoder))
        case "normalSweet":
            self = .normalSweet(try NormalSweet(from: decoder))
        case "popularLimit":
            self = .popularLimit(try PopularLimit(from: decoder))
        case "potableBad":
            self = .potableBad(try PotableBad(from: decoder))
        case "practicalPrinciple":
            self = .practicalPrinciple(try PracticalPrinciple(from: decoder))
        case "primaryBlock":
            self = .primaryBlock(try PrimaryBlock(from: decoder))
        case "rotatingRatio":
            self = .rotatingRatio(try RotatingRatio(from: decoder))
        case "thankfulFactor":
            self = .thankfulFactor(try ThankfulFactor(from: decoder))
        case "totalWork":
            self = .totalWork(try TotalWork(from: decoder))
        case "triangularRepair":
            self = .triangularRepair(try TriangularRepair(from: decoder))
        case "uniqueStress":
            self = .uniqueStress(try UniqueStress(from: decoder))
        case "unwillingSmoke":
            self = .unwillingSmoke(try UnwillingSmoke(from: decoder))
        case "vibrantExcitement":
            self = .vibrantExcitement(try VibrantExcitement(from: decoder))
        default:
            throw DecodingError.dataCorrupted(
                DecodingError.Context(
                    codingPath: decoder.codingPath,
                    debugDescription: "Unknown shape discriminant value: \(discriminant)"
                )
            )
        }
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        switch self {
        case .activeDiamond(let data):
            try container.encode("activeDiamond", forKey: .type)
            try data.encode(to: encoder)
        case .attractiveScript(let data):
            try container.encode("attractiveScript", forKey: .type)
            try data.encode(to: encoder)
        case .circularCard(let data):
            try container.encode("circularCard", forKey: .type)
            try data.encode(to: encoder)
        case .colorfulCover(let data):
            try container.encode("colorfulCover", forKey: .type)
            try data.encode(to: encoder)
        case .diligentDeal(let data):
            try container.encode("diligentDeal", forKey: .type)
            try data.encode(to: encoder)
        case .disloyalValue(let data):
            try container.encode("disloyalValue", forKey: .type)
            try data.encode(to: encoder)
        case .distinctFailure(let data):
            try container.encode("distinctFailure", forKey: .type)
            try data.encode(to: encoder)
        case .falseMirror(let data):
            try container.encode("falseMirror", forKey: .type)
            try data.encode(to: encoder)
        case .frozenSleep(let data):
            try container.encode("frozenSleep", forKey: .type)
            try data.encode(to: encoder)
        case .gaseousRoad(let data):
            try container.encode("gaseousRoad", forKey: .type)
            try data.encode(to: encoder)
        case .gruesomeCoach(let data):
            try container.encode("gruesomeCoach", forKey: .type)
            try data.encode(to: encoder)
        case .harmoniousPlay(let data):
            try container.encode("harmoniousPlay", forKey: .type)
            try data.encode(to: encoder)
        case .hastyPain(let data):
            try container.encode("hastyPain", forKey: .type)
            try data.encode(to: encoder)
        case .hoarseMouse(let data):
            try container.encode("hoarseMouse", forKey: .type)
            try data.encode(to: encoder)
        case .jumboEnd(let data):
            try container.encode("jumboEnd", forKey: .type)
            try data.encode(to: encoder)
        case .limpingStep(let data):
            try container.encode("limpingStep", forKey: .type)
            try data.encode(to: encoder)
        case .mistySnow(let data):
            try container.encode("mistySnow", forKey: .type)
            try data.encode(to: encoder)
        case .normalSweet(let data):
            try container.encode("normalSweet", forKey: .type)
            try data.encode(to: encoder)
        case .popularLimit(let data):
            try container.encode("popularLimit", forKey: .type)
            try data.encode(to: encoder)
        case .potableBad(let data):
            try container.encode("potableBad", forKey: .type)
            try data.encode(to: encoder)
        case .practicalPrinciple(let data):
            try container.encode("practicalPrinciple", forKey: .type)
            try data.encode(to: encoder)
        case .primaryBlock(let data):
            try container.encode("primaryBlock", forKey: .type)
            try data.encode(to: encoder)
        case .rotatingRatio(let data):
            try container.encode("rotatingRatio", forKey: .type)
            try data.encode(to: encoder)
        case .thankfulFactor(let data):
            try container.encode("thankfulFactor", forKey: .type)
            try data.encode(to: encoder)
        case .totalWork(let data):
            try container.encode("totalWork", forKey: .type)
            try data.encode(to: encoder)
        case .triangularRepair(let data):
            try container.encode("triangularRepair", forKey: .type)
            try data.encode(to: encoder)
        case .uniqueStress(let data):
            try container.encode("uniqueStress", forKey: .type)
            try data.encode(to: encoder)
        case .unwillingSmoke(let data):
            try container.encode("unwillingSmoke", forKey: .type)
            try data.encode(to: encoder)
        case .vibrantExcitement(let data):
            try container.encode("vibrantExcitement", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}