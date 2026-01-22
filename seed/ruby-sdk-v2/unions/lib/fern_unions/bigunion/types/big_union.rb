# frozen_string_literal: true

module FernUnions
  module Bigunion
    module Types
      class BigUnion < Internal::Types::Model
        extend FernUnions::Internal::Types::Union

        discriminant :type

        member -> { FernUnions::Bigunion::Types::NormalSweet }, key: "NORMAL_SWEET"
        member -> { FernUnions::Bigunion::Types::ThankfulFactor }, key: "THANKFUL_FACTOR"
        member -> { FernUnions::Bigunion::Types::JumboEnd }, key: "JUMBO_END"
        member -> { FernUnions::Bigunion::Types::HastyPain }, key: "HASTY_PAIN"
        member -> { FernUnions::Bigunion::Types::MistySnow }, key: "MISTY_SNOW"
        member -> { FernUnions::Bigunion::Types::DistinctFailure }, key: "DISTINCT_FAILURE"
        member -> { FernUnions::Bigunion::Types::PracticalPrinciple }, key: "PRACTICAL_PRINCIPLE"
        member -> { FernUnions::Bigunion::Types::LimpingStep }, key: "LIMPING_STEP"
        member -> { FernUnions::Bigunion::Types::VibrantExcitement }, key: "VIBRANT_EXCITEMENT"
        member -> { FernUnions::Bigunion::Types::ActiveDiamond }, key: "ACTIVE_DIAMOND"
        member -> { FernUnions::Bigunion::Types::PopularLimit }, key: "POPULAR_LIMIT"
        member -> { FernUnions::Bigunion::Types::FalseMirror }, key: "FALSE_MIRROR"
        member -> { FernUnions::Bigunion::Types::PrimaryBlock }, key: "PRIMARY_BLOCK"
        member -> { FernUnions::Bigunion::Types::RotatingRatio }, key: "ROTATING_RATIO"
        member -> { FernUnions::Bigunion::Types::ColorfulCover }, key: "COLORFUL_COVER"
        member -> { FernUnions::Bigunion::Types::DisloyalValue }, key: "DISLOYAL_VALUE"
        member -> { FernUnions::Bigunion::Types::GruesomeCoach }, key: "GRUESOME_COACH"
        member -> { FernUnions::Bigunion::Types::TotalWork }, key: "TOTAL_WORK"
        member -> { FernUnions::Bigunion::Types::HarmoniousPlay }, key: "HARMONIOUS_PLAY"
        member -> { FernUnions::Bigunion::Types::UniqueStress }, key: "UNIQUE_STRESS"
        member -> { FernUnions::Bigunion::Types::UnwillingSmoke }, key: "UNWILLING_SMOKE"
        member -> { FernUnions::Bigunion::Types::FrozenSleep }, key: "FROZEN_SLEEP"
        member -> { FernUnions::Bigunion::Types::DiligentDeal }, key: "DILIGENT_DEAL"
        member -> { FernUnions::Bigunion::Types::AttractiveScript }, key: "ATTRACTIVE_SCRIPT"
        member -> { FernUnions::Bigunion::Types::HoarseMouse }, key: "HOARSE_MOUSE"
        member -> { FernUnions::Bigunion::Types::CircularCard }, key: "CIRCULAR_CARD"
        member -> { FernUnions::Bigunion::Types::PotableBad }, key: "POTABLE_BAD"
        member -> { FernUnions::Bigunion::Types::TriangularRepair }, key: "TRIANGULAR_REPAIR"
        member -> { FernUnions::Bigunion::Types::GaseousRoad }, key: "GASEOUS_ROAD"
      end
    end
  end
end
