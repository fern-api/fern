# frozen_string_literal: true

require_relative "non_void_function_definition"
require_relative "assert_correctness_check"
require "ostruct"
require "json"

module SeedTraceClient
  module V2
    module V3
      class Problem
        class TestCaseWithActualResultImplementation
          # @return [SeedTraceClient::V2::V3::Problem::NonVoidFunctionDefinition]
          attr_reader :get_actual_result
          # @return [SeedTraceClient::V2::V3::Problem::AssertCorrectnessCheck]
          attr_reader :assert_correctness_check
          # @return [OpenStruct] Additional properties unmapped to the current class definition
          attr_reader :additional_properties
          # @return [Object]
          attr_reader :_field_set
          protected :_field_set

          OMIT = Object.new

          # @param get_actual_result [SeedTraceClient::V2::V3::Problem::NonVoidFunctionDefinition]
          # @param assert_correctness_check [SeedTraceClient::V2::V3::Problem::AssertCorrectnessCheck]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [SeedTraceClient::V2::V3::Problem::TestCaseWithActualResultImplementation]
          def initialize(get_actual_result:, assert_correctness_check:, additional_properties: nil)
            @get_actual_result = get_actual_result
            @assert_correctness_check = assert_correctness_check
            @additional_properties = additional_properties
            @_field_set = { "getActualResult": get_actual_result, "assertCorrectnessCheck": assert_correctness_check }
          end

          # Deserialize a JSON object to an instance of
          #  TestCaseWithActualResultImplementation
          #
          # @param json_object [String]
          # @return [SeedTraceClient::V2::V3::Problem::TestCaseWithActualResultImplementation]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            parsed_json = JSON.parse(json_object)
            if parsed_json["getActualResult"].nil?
              get_actual_result = nil
            else
              get_actual_result = parsed_json["getActualResult"].to_json
              get_actual_result = SeedTraceClient::V2::V3::Problem::NonVoidFunctionDefinition.from_json(json_object: get_actual_result)
            end
            if parsed_json["assertCorrectnessCheck"].nil?
              assert_correctness_check = nil
            else
              assert_correctness_check = parsed_json["assertCorrectnessCheck"].to_json
              assert_correctness_check = SeedTraceClient::V2::V3::Problem::AssertCorrectnessCheck.from_json(json_object: assert_correctness_check)
            end
            new(
              get_actual_result: get_actual_result,
              assert_correctness_check: assert_correctness_check,
              additional_properties: struct
            )
          end

          # Serialize an instance of TestCaseWithActualResultImplementation to a JSON object
          #
          # @return [String]
          def to_json(*_args)
            @_field_set&.to_json
          end

          # Leveraged for Union-type generation, validate_raw attempts to parse the given
          #  hash and check each fields type against the current object's property
          #  definitions.
          #
          # @param obj [Object]
          # @return [Void]
          def self.validate_raw(obj:)
            SeedTraceClient::V2::V3::Problem::NonVoidFunctionDefinition.validate_raw(obj: obj.get_actual_result)
            SeedTraceClient::V2::V3::Problem::AssertCorrectnessCheck.validate_raw(obj: obj.assert_correctness_check)
          end
        end
      end
    end
  end
end
