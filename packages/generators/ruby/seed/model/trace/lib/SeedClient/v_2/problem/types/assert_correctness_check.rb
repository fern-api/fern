# frozen_string_literal: true

require_relative "json"
require_relative "v_2/problem/types/DeepEqualityCorrectnessCheck"
require_relative "v_2/problem/types/VoidFunctionDefinitionThatTakesActualResult"

module SeedClient
  module V2
    module Problem
      class AssertCorrectnessCheck
        attr_reader :member, :discriminant

        private_class_method :new
        alias kind_of? is_a?
        # @param member [Object]
        # @param discriminant [String]
        # @return [V2::Problem::AssertCorrectnessCheck]
        def initialze(member:, discriminant:)
          # @type [Object]
          @member = member
          # @type [String]
          @discriminant = discriminant
        end

        # Deserialize a JSON object to an instance of AssertCorrectnessCheck
        #
        # @param json_object [JSON]
        # @return [V2::Problem::AssertCorrectnessCheck]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          member = case struct.type
                   when "deepEquality"
                     V2::Problem::DeepEqualityCorrectnessCheck.from_json(json_object: json_object)
                   when "custom"
                     V2::Problem::VoidFunctionDefinitionThatTakesActualResult.from_json(json_object: json_object)
                   else
                     V2::Problem::DeepEqualityCorrectnessCheck.from_json(json_object: json_object)
                   end
          new(member: member, discriminant: struct.type)
        end

        # For Union Types, to_json functionality is delegated to the wrapped member.
        #
        # @return [JSON]
        def to_json(*_args)
          case @discriminant
          when "deepEquality"
            { type: @discriminant, **@member.to_json }.to_json
          when "custom"
            { type: @discriminant, **@member.to_json }.to_json
          else
            { type: @discriminant, value: @member }.to_json
          end
          @member.to_json
        end

        # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
        #
        # @param obj [Object]
        # @return [Void]
        def self.validate_raw(obj:)
          case obj.type
          when "deepEquality"
            V2::Problem::DeepEqualityCorrectnessCheck.validate_raw(obj: obj)
          when "custom"
            V2::Problem::VoidFunctionDefinitionThatTakesActualResult.validate_raw(obj: obj)
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

        # @param member [V2::Problem::DeepEqualityCorrectnessCheck]
        # @return [V2::Problem::AssertCorrectnessCheck]
        def self.deep_equality(member:)
          new(member: member, discriminant: "deepEquality")
        end

        # @param member [V2::Problem::VoidFunctionDefinitionThatTakesActualResult]
        # @return [V2::Problem::AssertCorrectnessCheck]
        def self.custom(member:)
          new(member: member, discriminant: "custom")
        end
      end
    end
  end
end
