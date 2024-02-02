# frozen_string_literal: true

require_relative "non_void_function_definition"
require_relative "assert_correctness_check"
require "json"

module SeedTraceClient
  module V2
    module V3
      module Problem
        class TestCaseWithActualResultImplementation
          attr_reader :get_actual_result, :assert_correctness_check, :additional_properties

          # @param get_actual_result [V2::V3::Problem::NonVoidFunctionDefinition]
          # @param assert_correctness_check [V2::V3::Problem::AssertCorrectnessCheck]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [V2::V3::Problem::TestCaseWithActualResultImplementation]
          def initialize(get_actual_result:, assert_correctness_check:, additional_properties: nil)
            # @type [V2::V3::Problem::NonVoidFunctionDefinition]
            @get_actual_result = get_actual_result
            # @type [V2::V3::Problem::AssertCorrectnessCheck]
            @assert_correctness_check = assert_correctness_check
            # @type [OpenStruct] Additional properties unmapped to the current class definition
            @additional_properties = additional_properties
          end

          # Deserialize a JSON object to an instance of TestCaseWithActualResultImplementation
          #
          # @param json_object [JSON]
          # @return [V2::V3::Problem::TestCaseWithActualResultImplementation]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            get_actual_result = struct.getActualResult
            assert_correctness_check = struct.assertCorrectnessCheck
            new(get_actual_result: get_actual_result, assert_correctness_check: assert_correctness_check,
                additional_properties: struct)
          end

          # Serialize an instance of TestCaseWithActualResultImplementation to a JSON object
          #
          # @return [JSON]
          def to_json(*_args)
            { "getActualResult": @get_actual_result, "assertCorrectnessCheck": @assert_correctness_check }.to_json
          end

          # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
          #
          # @param obj [Object]
          # @return [Void]
          def self.validate_raw(obj:)
            V2::V3::Problem::NonVoidFunctionDefinition.validate_raw(obj: obj.get_actual_result)
            V2::V3::Problem::AssertCorrectnessCheck.validate_raw(obj: obj.assert_correctness_check)
          end
        end
      end
    end
  end
end
