# frozen_string_literal: true

require "json"
require_relative "test_case_with_actual_result_implementation"
require_relative "void_function_definition"

module SeedTraceClient
  module V2
    class Problem
      class TestCaseFunction
        attr_reader :member, :discriminant

        private_class_method :new
        alias kind_of? is_a?
        # @param member [Object]
        # @param discriminant [String]
        # @return [V2::Problem::TestCaseFunction]
        def initialize(member:, discriminant:)
          # @type [Object]
          @member = member
          # @type [String]
          @discriminant = discriminant
        end

        # Deserialize a JSON object to an instance of TestCaseFunction
        #
        # @param json_object [JSON]
        # @return [V2::Problem::TestCaseFunction]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          member = case struct.type
                   when "withActualResult"
                     V2::Problem::TestCaseWithActualResultImplementation.from_json(json_object: json_object)
                   when "custom"
                     V2::Problem::VoidFunctionDefinition.from_json(json_object: json_object)
                   else
                     V2::Problem::TestCaseWithActualResultImplementation.from_json(json_object: json_object)
                   end
          new(member: member, discriminant: struct.type)
        end

        # For Union Types, to_json functionality is delegated to the wrapped member.
        #
        # @return [JSON]
        def to_json(*_args)
          case @discriminant
          when "withActualResult"
            { **@member.to_json, type: @discriminant }.to_json
          when "custom"
            { **@member.to_json, type: @discriminant }.to_json
          else
            { "type": @discriminant, value: @member }.to_json
          end
          @member.to_json
        end

        # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
        #
        # @param obj [Object]
        # @return [Void]
        def self.validate_raw(obj:)
          case obj.type
          when "withActualResult"
            V2::Problem::TestCaseWithActualResultImplementation.validate_raw(obj: obj)
          when "custom"
            V2::Problem::VoidFunctionDefinition.validate_raw(obj: obj)
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

        # @param member [V2::Problem::TestCaseWithActualResultImplementation]
        # @return [V2::Problem::TestCaseFunction]
        def self.with_actual_result(member:)
          new(member: member, discriminant: "withActualResult")
        end

        # @param member [V2::Problem::VoidFunctionDefinition]
        # @return [V2::Problem::TestCaseFunction]
        def self.custom(member:)
          new(member: member, discriminant: "custom")
        end
      end
    end
  end
end
