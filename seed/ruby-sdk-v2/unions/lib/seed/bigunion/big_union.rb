# frozen_string_literal: true

module Seed
    module Types
        class BigUnion < Internal::Types::Union

            discriminant :type

            member -> { Seed::Bigunion::NormalSweet }, key: "NORMAL_SWEET"
            member -> { Seed::Bigunion::ThankfulFactor }, key: "THANKFUL_FACTOR"
            member -> { Seed::Bigunion::JumboEnd }, key: "JUMBO_END"
            member -> { Seed::Bigunion::HastyPain }, key: "HASTY_PAIN"
            member -> { Seed::Bigunion::MistySnow }, key: "MISTY_SNOW"
            member -> { Seed::Bigunion::DistinctFailure }, key: "DISTINCT_FAILURE"
            member -> { Seed::Bigunion::PracticalPrinciple }, key: "PRACTICAL_PRINCIPLE"
            member -> { Seed::Bigunion::LimpingStep }, key: "LIMPING_STEP"
            member -> { Seed::Bigunion::VibrantExcitement }, key: "VIBRANT_EXCITEMENT"
            member -> { Seed::Bigunion::ActiveDiamond }, key: "ACTIVE_DIAMOND"
            member -> { Seed::Bigunion::PopularLimit }, key: "POPULAR_LIMIT"
            member -> { Seed::Bigunion::FalseMirror }, key: "FALSE_MIRROR"
            member -> { Seed::Bigunion::PrimaryBlock }, key: "PRIMARY_BLOCK"
            member -> { Seed::Bigunion::RotatingRatio }, key: "ROTATING_RATIO"
            member -> { Seed::Bigunion::ColorfulCover }, key: "COLORFUL_COVER"
            member -> { Seed::Bigunion::DisloyalValue }, key: "DISLOYAL_VALUE"
            member -> { Seed::Bigunion::GruesomeCoach }, key: "GRUESOME_COACH"
            member -> { Seed::Bigunion::TotalWork }, key: "TOTAL_WORK"
            member -> { Seed::Bigunion::HarmoniousPlay }, key: "HARMONIOUS_PLAY"
            member -> { Seed::Bigunion::UniqueStress }, key: "UNIQUE_STRESS"
            member -> { Seed::Bigunion::UnwillingSmoke }, key: "UNWILLING_SMOKE"
            member -> { Seed::Bigunion::FrozenSleep }, key: "FROZEN_SLEEP"
            member -> { Seed::Bigunion::DiligentDeal }, key: "DILIGENT_DEAL"
            member -> { Seed::Bigunion::AttractiveScript }, key: "ATTRACTIVE_SCRIPT"
            member -> { Seed::Bigunion::HoarseMouse }, key: "HOARSE_MOUSE"
            member -> { Seed::Bigunion::CircularCard }, key: "CIRCULAR_CARD"
            member -> { Seed::Bigunion::PotableBad }, key: "POTABLE_BAD"
            member -> { Seed::Bigunion::TriangularRepair }, key: "TRIANGULAR_REPAIR"
            member -> { Seed::Bigunion::GaseousRoad }, key: "GASEOUS_ROAD"
    end
end
