# frozen_string_literal: true

require "date"
require "json"
require_relative "normal_sweet"
require_relative "thankful_factor"
require_relative "jumbo_end"
require_relative "hasty_pain"
require_relative "misty_snow"
require_relative "distinct_failure"
require_relative "practical_principle"
require_relative "limping_step"
require_relative "vibrant_excitement"
require_relative "active_diamond"
require_relative "popular_limit"
require_relative "false_mirror"
require_relative "primary_block"
require_relative "rotating_ratio"
require_relative "colorful_cover"
require_relative "disloyal_value"
require_relative "gruesome_coach"
require_relative "total_work"
require_relative "harmonious_play"
require_relative "unique_stress"
require_relative "unwilling_smoke"
require_relative "frozen_sleep"
require_relative "diligent_deal"
require_relative "attractive_script"
require_relative "hoarse_mouse"
require_relative "circular_card"
require_relative "potable_bad"
require_relative "triangular_repair"
require_relative "gaseous_road"

module SeedUnionsClient
  class Bigunion
    class BigUnion
      # @return [Object]
      attr_reader :member
      # @return [String]
      attr_reader :discriminant
      # @return [String]
      attr_reader :id
      # @return [DateTime]
      attr_reader :created_at
      # @return [DateTime]
      attr_reader :archived_at

      private_class_method :new
      alias kind_of? is_a?

      # @param member [Object]
      # @param discriminant [String]
      # @param id [String]
      # @param created_at [DateTime]
      # @param archived_at [DateTime]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def initialize(member:, discriminant:, id:, created_at:, archived_at: nil)
        @member = member
        @discriminant = discriminant
        @id = id
        @created_at = created_at
        @archived_at = archived_at
      end

      # Deserialize a JSON object to an instance of BigUnion
      #
      # @param json_object [String]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "normalSweet"
                   SeedUnionsClient::Bigunion::NormalSweet.from_json(json_object: json_object)
                 when "thankfulFactor"
                   SeedUnionsClient::Bigunion::ThankfulFactor.from_json(json_object: json_object)
                 when "jumboEnd"
                   SeedUnionsClient::Bigunion::JumboEnd.from_json(json_object: json_object)
                 when "hastyPain"
                   SeedUnionsClient::Bigunion::HastyPain.from_json(json_object: json_object)
                 when "mistySnow"
                   SeedUnionsClient::Bigunion::MistySnow.from_json(json_object: json_object)
                 when "distinctFailure"
                   SeedUnionsClient::Bigunion::DistinctFailure.from_json(json_object: json_object)
                 when "practicalPrinciple"
                   SeedUnionsClient::Bigunion::PracticalPrinciple.from_json(json_object: json_object)
                 when "limpingStep"
                   SeedUnionsClient::Bigunion::LimpingStep.from_json(json_object: json_object)
                 when "vibrantExcitement"
                   SeedUnionsClient::Bigunion::VibrantExcitement.from_json(json_object: json_object)
                 when "activeDiamond"
                   SeedUnionsClient::Bigunion::ActiveDiamond.from_json(json_object: json_object)
                 when "popularLimit"
                   SeedUnionsClient::Bigunion::PopularLimit.from_json(json_object: json_object)
                 when "falseMirror"
                   SeedUnionsClient::Bigunion::FalseMirror.from_json(json_object: json_object)
                 when "primaryBlock"
                   SeedUnionsClient::Bigunion::PrimaryBlock.from_json(json_object: json_object)
                 when "rotatingRatio"
                   SeedUnionsClient::Bigunion::RotatingRatio.from_json(json_object: json_object)
                 when "colorfulCover"
                   SeedUnionsClient::Bigunion::ColorfulCover.from_json(json_object: json_object)
                 when "disloyalValue"
                   SeedUnionsClient::Bigunion::DisloyalValue.from_json(json_object: json_object)
                 when "gruesomeCoach"
                   SeedUnionsClient::Bigunion::GruesomeCoach.from_json(json_object: json_object)
                 when "totalWork"
                   SeedUnionsClient::Bigunion::TotalWork.from_json(json_object: json_object)
                 when "harmoniousPlay"
                   SeedUnionsClient::Bigunion::HarmoniousPlay.from_json(json_object: json_object)
                 when "uniqueStress"
                   SeedUnionsClient::Bigunion::UniqueStress.from_json(json_object: json_object)
                 when "unwillingSmoke"
                   SeedUnionsClient::Bigunion::UnwillingSmoke.from_json(json_object: json_object)
                 when "frozenSleep"
                   SeedUnionsClient::Bigunion::FrozenSleep.from_json(json_object: json_object)
                 when "diligentDeal"
                   SeedUnionsClient::Bigunion::DiligentDeal.from_json(json_object: json_object)
                 when "attractiveScript"
                   SeedUnionsClient::Bigunion::AttractiveScript.from_json(json_object: json_object)
                 when "hoarseMouse"
                   SeedUnionsClient::Bigunion::HoarseMouse.from_json(json_object: json_object)
                 when "circularCard"
                   SeedUnionsClient::Bigunion::CircularCard.from_json(json_object: json_object)
                 when "potableBad"
                   SeedUnionsClient::Bigunion::PotableBad.from_json(json_object: json_object)
                 when "triangularRepair"
                   SeedUnionsClient::Bigunion::TriangularRepair.from_json(json_object: json_object)
                 when "gaseousRoad"
                   SeedUnionsClient::Bigunion::GaseousRoad.from_json(json_object: json_object)
                 else
                   SeedUnionsClient::Bigunion::NormalSweet.from_json(json_object: json_object)
                 end
        new(member: member, discriminant: struct.type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [String]
      def to_json(*_args)
        case @discriminant
        when "normalSweet"
          { **@member.to_json, type: @discriminant }.to_json
        when "thankfulFactor"
          { **@member.to_json, type: @discriminant }.to_json
        when "jumboEnd"
          { **@member.to_json, type: @discriminant }.to_json
        when "hastyPain"
          { **@member.to_json, type: @discriminant }.to_json
        when "mistySnow"
          { **@member.to_json, type: @discriminant }.to_json
        when "distinctFailure"
          { **@member.to_json, type: @discriminant }.to_json
        when "practicalPrinciple"
          { **@member.to_json, type: @discriminant }.to_json
        when "limpingStep"
          { **@member.to_json, type: @discriminant }.to_json
        when "vibrantExcitement"
          { **@member.to_json, type: @discriminant }.to_json
        when "activeDiamond"
          { **@member.to_json, type: @discriminant }.to_json
        when "popularLimit"
          { **@member.to_json, type: @discriminant }.to_json
        when "falseMirror"
          { **@member.to_json, type: @discriminant }.to_json
        when "primaryBlock"
          { **@member.to_json, type: @discriminant }.to_json
        when "rotatingRatio"
          { **@member.to_json, type: @discriminant }.to_json
        when "colorfulCover"
          { **@member.to_json, type: @discriminant }.to_json
        when "disloyalValue"
          { **@member.to_json, type: @discriminant }.to_json
        when "gruesomeCoach"
          { **@member.to_json, type: @discriminant }.to_json
        when "totalWork"
          { **@member.to_json, type: @discriminant }.to_json
        when "harmoniousPlay"
          { **@member.to_json, type: @discriminant }.to_json
        when "uniqueStress"
          { **@member.to_json, type: @discriminant }.to_json
        when "unwillingSmoke"
          { **@member.to_json, type: @discriminant }.to_json
        when "frozenSleep"
          { **@member.to_json, type: @discriminant }.to_json
        when "diligentDeal"
          { **@member.to_json, type: @discriminant }.to_json
        when "attractiveScript"
          { **@member.to_json, type: @discriminant }.to_json
        when "hoarseMouse"
          { **@member.to_json, type: @discriminant }.to_json
        when "circularCard"
          { **@member.to_json, type: @discriminant }.to_json
        when "potableBad"
          { **@member.to_json, type: @discriminant }.to_json
        when "triangularRepair"
          { **@member.to_json, type: @discriminant }.to_json
        when "gaseousRoad"
          { **@member.to_json, type: @discriminant }.to_json
        else
          { "type": @discriminant, value: @member }.to_json
        end
        @member.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given
      #  hash and check each fields type against the current object's property
      #  definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        case obj.type
        when "normalSweet"
          SeedUnionsClient::Bigunion::NormalSweet.validate_raw(obj: obj)
        when "thankfulFactor"
          SeedUnionsClient::Bigunion::ThankfulFactor.validate_raw(obj: obj)
        when "jumboEnd"
          SeedUnionsClient::Bigunion::JumboEnd.validate_raw(obj: obj)
        when "hastyPain"
          SeedUnionsClient::Bigunion::HastyPain.validate_raw(obj: obj)
        when "mistySnow"
          SeedUnionsClient::Bigunion::MistySnow.validate_raw(obj: obj)
        when "distinctFailure"
          SeedUnionsClient::Bigunion::DistinctFailure.validate_raw(obj: obj)
        when "practicalPrinciple"
          SeedUnionsClient::Bigunion::PracticalPrinciple.validate_raw(obj: obj)
        when "limpingStep"
          SeedUnionsClient::Bigunion::LimpingStep.validate_raw(obj: obj)
        when "vibrantExcitement"
          SeedUnionsClient::Bigunion::VibrantExcitement.validate_raw(obj: obj)
        when "activeDiamond"
          SeedUnionsClient::Bigunion::ActiveDiamond.validate_raw(obj: obj)
        when "popularLimit"
          SeedUnionsClient::Bigunion::PopularLimit.validate_raw(obj: obj)
        when "falseMirror"
          SeedUnionsClient::Bigunion::FalseMirror.validate_raw(obj: obj)
        when "primaryBlock"
          SeedUnionsClient::Bigunion::PrimaryBlock.validate_raw(obj: obj)
        when "rotatingRatio"
          SeedUnionsClient::Bigunion::RotatingRatio.validate_raw(obj: obj)
        when "colorfulCover"
          SeedUnionsClient::Bigunion::ColorfulCover.validate_raw(obj: obj)
        when "disloyalValue"
          SeedUnionsClient::Bigunion::DisloyalValue.validate_raw(obj: obj)
        when "gruesomeCoach"
          SeedUnionsClient::Bigunion::GruesomeCoach.validate_raw(obj: obj)
        when "totalWork"
          SeedUnionsClient::Bigunion::TotalWork.validate_raw(obj: obj)
        when "harmoniousPlay"
          SeedUnionsClient::Bigunion::HarmoniousPlay.validate_raw(obj: obj)
        when "uniqueStress"
          SeedUnionsClient::Bigunion::UniqueStress.validate_raw(obj: obj)
        when "unwillingSmoke"
          SeedUnionsClient::Bigunion::UnwillingSmoke.validate_raw(obj: obj)
        when "frozenSleep"
          SeedUnionsClient::Bigunion::FrozenSleep.validate_raw(obj: obj)
        when "diligentDeal"
          SeedUnionsClient::Bigunion::DiligentDeal.validate_raw(obj: obj)
        when "attractiveScript"
          SeedUnionsClient::Bigunion::AttractiveScript.validate_raw(obj: obj)
        when "hoarseMouse"
          SeedUnionsClient::Bigunion::HoarseMouse.validate_raw(obj: obj)
        when "circularCard"
          SeedUnionsClient::Bigunion::CircularCard.validate_raw(obj: obj)
        when "potableBad"
          SeedUnionsClient::Bigunion::PotableBad.validate_raw(obj: obj)
        when "triangularRepair"
          SeedUnionsClient::Bigunion::TriangularRepair.validate_raw(obj: obj)
        when "gaseousRoad"
          SeedUnionsClient::Bigunion::GaseousRoad.validate_raw(obj: obj)
        else
          raise("Passed value matched no type within the union, validation failed.")
        end
      end

      # For Union Types, is_a? functionality is delegated to the wrapped member.
      #
      # @param obj [Object]
      # @return [Boolean]
      def is_a?(obj)
        @member.is_a?(obj)
      end

      # @param member [SeedUnionsClient::Bigunion::NormalSweet]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def self.normal_sweet(member:)
        new(member: member, discriminant: "normalSweet")
      end

      # @param member [SeedUnionsClient::Bigunion::ThankfulFactor]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def self.thankful_factor(member:)
        new(member: member, discriminant: "thankfulFactor")
      end

      # @param member [SeedUnionsClient::Bigunion::JumboEnd]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def self.jumbo_end(member:)
        new(member: member, discriminant: "jumboEnd")
      end

      # @param member [SeedUnionsClient::Bigunion::HastyPain]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def self.hasty_pain(member:)
        new(member: member, discriminant: "hastyPain")
      end

      # @param member [SeedUnionsClient::Bigunion::MistySnow]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def self.misty_snow(member:)
        new(member: member, discriminant: "mistySnow")
      end

      # @param member [SeedUnionsClient::Bigunion::DistinctFailure]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def self.distinct_failure(member:)
        new(member: member, discriminant: "distinctFailure")
      end

      # @param member [SeedUnionsClient::Bigunion::PracticalPrinciple]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def self.practical_principle(member:)
        new(member: member, discriminant: "practicalPrinciple")
      end

      # @param member [SeedUnionsClient::Bigunion::LimpingStep]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def self.limping_step(member:)
        new(member: member, discriminant: "limpingStep")
      end

      # @param member [SeedUnionsClient::Bigunion::VibrantExcitement]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def self.vibrant_excitement(member:)
        new(member: member, discriminant: "vibrantExcitement")
      end

      # @param member [SeedUnionsClient::Bigunion::ActiveDiamond]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def self.active_diamond(member:)
        new(member: member, discriminant: "activeDiamond")
      end

      # @param member [SeedUnionsClient::Bigunion::PopularLimit]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def self.popular_limit(member:)
        new(member: member, discriminant: "popularLimit")
      end

      # @param member [SeedUnionsClient::Bigunion::FalseMirror]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def self.false_mirror(member:)
        new(member: member, discriminant: "falseMirror")
      end

      # @param member [SeedUnionsClient::Bigunion::PrimaryBlock]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def self.primary_block(member:)
        new(member: member, discriminant: "primaryBlock")
      end

      # @param member [SeedUnionsClient::Bigunion::RotatingRatio]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def self.rotating_ratio(member:)
        new(member: member, discriminant: "rotatingRatio")
      end

      # @param member [SeedUnionsClient::Bigunion::ColorfulCover]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def self.colorful_cover(member:)
        new(member: member, discriminant: "colorfulCover")
      end

      # @param member [SeedUnionsClient::Bigunion::DisloyalValue]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def self.disloyal_value(member:)
        new(member: member, discriminant: "disloyalValue")
      end

      # @param member [SeedUnionsClient::Bigunion::GruesomeCoach]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def self.gruesome_coach(member:)
        new(member: member, discriminant: "gruesomeCoach")
      end

      # @param member [SeedUnionsClient::Bigunion::TotalWork]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def self.total_work(member:)
        new(member: member, discriminant: "totalWork")
      end

      # @param member [SeedUnionsClient::Bigunion::HarmoniousPlay]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def self.harmonious_play(member:)
        new(member: member, discriminant: "harmoniousPlay")
      end

      # @param member [SeedUnionsClient::Bigunion::UniqueStress]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def self.unique_stress(member:)
        new(member: member, discriminant: "uniqueStress")
      end

      # @param member [SeedUnionsClient::Bigunion::UnwillingSmoke]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def self.unwilling_smoke(member:)
        new(member: member, discriminant: "unwillingSmoke")
      end

      # @param member [SeedUnionsClient::Bigunion::FrozenSleep]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def self.frozen_sleep(member:)
        new(member: member, discriminant: "frozenSleep")
      end

      # @param member [SeedUnionsClient::Bigunion::DiligentDeal]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def self.diligent_deal(member:)
        new(member: member, discriminant: "diligentDeal")
      end

      # @param member [SeedUnionsClient::Bigunion::AttractiveScript]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def self.attractive_script(member:)
        new(member: member, discriminant: "attractiveScript")
      end

      # @param member [SeedUnionsClient::Bigunion::HoarseMouse]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def self.hoarse_mouse(member:)
        new(member: member, discriminant: "hoarseMouse")
      end

      # @param member [SeedUnionsClient::Bigunion::CircularCard]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def self.circular_card(member:)
        new(member: member, discriminant: "circularCard")
      end

      # @param member [SeedUnionsClient::Bigunion::PotableBad]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def self.potable_bad(member:)
        new(member: member, discriminant: "potableBad")
      end

      # @param member [SeedUnionsClient::Bigunion::TriangularRepair]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def self.triangular_repair(member:)
        new(member: member, discriminant: "triangularRepair")
      end

      # @param member [SeedUnionsClient::Bigunion::GaseousRoad]
      # @return [SeedUnionsClient::Bigunion::BigUnion]
      def self.gaseous_road(member:)
        new(member: member, discriminant: "gaseousRoad")
      end
    end
  end
end
