# frozen_string_literal: true

module Seed
  module Bigunion
    module Types
      class BigUnion < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Bigunion::Types::NormalSweet }, key: "NORMAL_SWEET"
        member -> { Seed::Bigunion::Types::ThankfulFactor }, key: "THANKFUL_FACTOR"
        member -> { Seed::Bigunion::Types::JumboEnd }, key: "JUMBO_END"
        member -> { Seed::Bigunion::Types::HastyPain }, key: "HASTY_PAIN"
        member -> { Seed::Bigunion::Types::MistySnow }, key: "MISTY_SNOW"
        member -> { Seed::Bigunion::Types::DistinctFailure }, key: "DISTINCT_FAILURE"
        member -> { Seed::Bigunion::Types::PracticalPrinciple }, key: "PRACTICAL_PRINCIPLE"
        member -> { Seed::Bigunion::Types::LimpingStep }, key: "LIMPING_STEP"
        member -> { Seed::Bigunion::Types::VibrantExcitement }, key: "VIBRANT_EXCITEMENT"
        member -> { Seed::Bigunion::Types::ActiveDiamond }, key: "ACTIVE_DIAMOND"
        member -> { Seed::Bigunion::Types::PopularLimit }, key: "POPULAR_LIMIT"
        member -> { Seed::Bigunion::Types::FalseMirror }, key: "FALSE_MIRROR"
        member -> { Seed::Bigunion::Types::PrimaryBlock }, key: "PRIMARY_BLOCK"
        member -> { Seed::Bigunion::Types::RotatingRatio }, key: "ROTATING_RATIO"
        member -> { Seed::Bigunion::Types::ColorfulCover }, key: "COLORFUL_COVER"
        member -> { Seed::Bigunion::Types::DisloyalValue }, key: "DISLOYAL_VALUE"
        member -> { Seed::Bigunion::Types::GruesomeCoach }, key: "GRUESOME_COACH"
        member -> { Seed::Bigunion::Types::TotalWork }, key: "TOTAL_WORK"
        member -> { Seed::Bigunion::Types::HarmoniousPlay }, key: "HARMONIOUS_PLAY"
        member -> { Seed::Bigunion::Types::UniqueStress }, key: "UNIQUE_STRESS"
        member -> { Seed::Bigunion::Types::UnwillingSmoke }, key: "UNWILLING_SMOKE"
        member -> { Seed::Bigunion::Types::FrozenSleep }, key: "FROZEN_SLEEP"
        member -> { Seed::Bigunion::Types::DiligentDeal }, key: "DILIGENT_DEAL"
        member -> { Seed::Bigunion::Types::AttractiveScript }, key: "ATTRACTIVE_SCRIPT"
        member -> { Seed::Bigunion::Types::HoarseMouse }, key: "HOARSE_MOUSE"
        member -> { Seed::Bigunion::Types::CircularCard }, key: "CIRCULAR_CARD"
        member -> { Seed::Bigunion::Types::PotableBad }, key: "POTABLE_BAD"
        member -> { Seed::Bigunion::Types::TriangularRepair }, key: "TRIANGULAR_REPAIR"
        member -> { Seed::Bigunion::Types::GaseousRoad }, key: "GASEOUS_ROAD"
      end
    end
  end
end
