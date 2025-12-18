# frozen_string_literal: true

module Seed
  module Bigunion
    module Types
      class BigUnion < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Bigunion::Types::NormalSweet }, key: "normalSweet"
        member -> { Seed::Bigunion::Types::ThankfulFactor }, key: "thankfulFactor"
        member -> { Seed::Bigunion::Types::JumboEnd }, key: "jumboEnd"
        member -> { Seed::Bigunion::Types::HastyPain }, key: "hastyPain"
        member -> { Seed::Bigunion::Types::MistySnow }, key: "mistySnow"
        member -> { Seed::Bigunion::Types::DistinctFailure }, key: "distinctFailure"
        member -> { Seed::Bigunion::Types::PracticalPrinciple }, key: "practicalPrinciple"
        member -> { Seed::Bigunion::Types::LimpingStep }, key: "limpingStep"
        member -> { Seed::Bigunion::Types::VibrantExcitement }, key: "vibrantExcitement"
        member -> { Seed::Bigunion::Types::ActiveDiamond }, key: "activeDiamond"
        member -> { Seed::Bigunion::Types::PopularLimit }, key: "popularLimit"
        member -> { Seed::Bigunion::Types::FalseMirror }, key: "falseMirror"
        member -> { Seed::Bigunion::Types::PrimaryBlock }, key: "primaryBlock"
        member -> { Seed::Bigunion::Types::RotatingRatio }, key: "rotatingRatio"
        member -> { Seed::Bigunion::Types::ColorfulCover }, key: "colorfulCover"
        member -> { Seed::Bigunion::Types::DisloyalValue }, key: "disloyalValue"
        member -> { Seed::Bigunion::Types::GruesomeCoach }, key: "gruesomeCoach"
        member -> { Seed::Bigunion::Types::TotalWork }, key: "totalWork"
        member -> { Seed::Bigunion::Types::HarmoniousPlay }, key: "harmoniousPlay"
        member -> { Seed::Bigunion::Types::UniqueStress }, key: "uniqueStress"
        member -> { Seed::Bigunion::Types::UnwillingSmoke }, key: "unwillingSmoke"
        member -> { Seed::Bigunion::Types::FrozenSleep }, key: "frozenSleep"
        member -> { Seed::Bigunion::Types::DiligentDeal }, key: "diligentDeal"
        member -> { Seed::Bigunion::Types::AttractiveScript }, key: "attractiveScript"
        member -> { Seed::Bigunion::Types::HoarseMouse }, key: "hoarseMouse"
        member -> { Seed::Bigunion::Types::CircularCard }, key: "circularCard"
        member -> { Seed::Bigunion::Types::PotableBad }, key: "potableBad"
        member -> { Seed::Bigunion::Types::TriangularRepair }, key: "triangularRepair"
        member -> { Seed::Bigunion::Types::GaseousRoad }, key: "gaseousRoad"
      end
    end
  end
end
