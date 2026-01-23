# frozen_string_literal: true

module FernUnionsWithLocalDate
  module Bigunion
    module Types
      class BigUnion < Internal::Types::Model
        extend FernUnionsWithLocalDate::Internal::Types::Union

        discriminant :type

        member -> { FernUnionsWithLocalDate::Bigunion::Types::NormalSweet }, key: "NORMAL_SWEET"
        member -> { FernUnionsWithLocalDate::Bigunion::Types::ThankfulFactor }, key: "THANKFUL_FACTOR"
        member -> { FernUnionsWithLocalDate::Bigunion::Types::JumboEnd }, key: "JUMBO_END"
        member -> { FernUnionsWithLocalDate::Bigunion::Types::HastyPain }, key: "HASTY_PAIN"
        member -> { FernUnionsWithLocalDate::Bigunion::Types::MistySnow }, key: "MISTY_SNOW"
        member -> { FernUnionsWithLocalDate::Bigunion::Types::DistinctFailure }, key: "DISTINCT_FAILURE"
        member -> { FernUnionsWithLocalDate::Bigunion::Types::PracticalPrinciple }, key: "PRACTICAL_PRINCIPLE"
        member -> { FernUnionsWithLocalDate::Bigunion::Types::LimpingStep }, key: "LIMPING_STEP"
        member -> { FernUnionsWithLocalDate::Bigunion::Types::VibrantExcitement }, key: "VIBRANT_EXCITEMENT"
        member -> { FernUnionsWithLocalDate::Bigunion::Types::ActiveDiamond }, key: "ACTIVE_DIAMOND"
        member -> { FernUnionsWithLocalDate::Bigunion::Types::PopularLimit }, key: "POPULAR_LIMIT"
        member -> { FernUnionsWithLocalDate::Bigunion::Types::FalseMirror }, key: "FALSE_MIRROR"
        member -> { FernUnionsWithLocalDate::Bigunion::Types::PrimaryBlock }, key: "PRIMARY_BLOCK"
        member -> { FernUnionsWithLocalDate::Bigunion::Types::RotatingRatio }, key: "ROTATING_RATIO"
        member -> { FernUnionsWithLocalDate::Bigunion::Types::ColorfulCover }, key: "COLORFUL_COVER"
        member -> { FernUnionsWithLocalDate::Bigunion::Types::DisloyalValue }, key: "DISLOYAL_VALUE"
        member -> { FernUnionsWithLocalDate::Bigunion::Types::GruesomeCoach }, key: "GRUESOME_COACH"
        member -> { FernUnionsWithLocalDate::Bigunion::Types::TotalWork }, key: "TOTAL_WORK"
        member -> { FernUnionsWithLocalDate::Bigunion::Types::HarmoniousPlay }, key: "HARMONIOUS_PLAY"
        member -> { FernUnionsWithLocalDate::Bigunion::Types::UniqueStress }, key: "UNIQUE_STRESS"
        member -> { FernUnionsWithLocalDate::Bigunion::Types::UnwillingSmoke }, key: "UNWILLING_SMOKE"
        member -> { FernUnionsWithLocalDate::Bigunion::Types::FrozenSleep }, key: "FROZEN_SLEEP"
        member -> { FernUnionsWithLocalDate::Bigunion::Types::DiligentDeal }, key: "DILIGENT_DEAL"
        member -> { FernUnionsWithLocalDate::Bigunion::Types::AttractiveScript }, key: "ATTRACTIVE_SCRIPT"
        member -> { FernUnionsWithLocalDate::Bigunion::Types::HoarseMouse }, key: "HOARSE_MOUSE"
        member -> { FernUnionsWithLocalDate::Bigunion::Types::CircularCard }, key: "CIRCULAR_CARD"
        member -> { FernUnionsWithLocalDate::Bigunion::Types::PotableBad }, key: "POTABLE_BAD"
        member -> { FernUnionsWithLocalDate::Bigunion::Types::TriangularRepair }, key: "TRIANGULAR_REPAIR"
        member -> { FernUnionsWithLocalDate::Bigunion::Types::GaseousRoad }, key: "GASEOUS_ROAD"
      end
    end
  end
end
