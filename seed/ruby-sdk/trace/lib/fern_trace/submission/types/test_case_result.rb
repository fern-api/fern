# frozen_string_literal: true

require_relative "../../commons/types/variable_value"
require_relative "actual_result"
require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class TestCaseResult
      # @return [SeedTraceClient::Commons::VariableValue]
      attr_reader :expected_result
      # @return [SeedTraceClient::Submission::ActualResult]
      attr_reader :actual_result
      # @return [Boolean]
      attr_reader :passed
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param expected_result [SeedTraceClient::Commons::VariableValue]
      # @param actual_result [SeedTraceClient::Submission::ActualResult]
      # @param passed [Boolean]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::TestCaseResult]
      def initialize(expected_result:, actual_result:, passed:, additional_properties: nil)
        @expected_result = expected_result
        @actual_result = actual_result
        @passed = passed
        @additional_properties = additional_properties
        @_field_set = { "expectedResult": expected_result, "actualResult": actual_result, "passed": passed }
      end

      # Deserialize a JSON object to an instance of TestCaseResult
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::TestCaseResult]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["expectedResult"].nil?
          expected_result = nil
        else
          expected_result = parsed_json["expectedResult"].to_json
          expected_result = SeedTraceClient::Commons::VariableValue.from_json(json_object: expected_result)
        end
        if parsed_json["actualResult"].nil?
          actual_result = nil
        else
          actual_result = parsed_json["actualResult"].to_json
          actual_result = SeedTraceClient::Submission::ActualResult.from_json(json_object: actual_result)
        end
        passed = parsed_json["passed"]
        new(
          expected_result: expected_result,
          actual_result: actual_result,
          passed: passed,
          additional_properties: struct
        )
      end

      # Serialize an instance of TestCaseResult to a JSON object
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
        SeedTraceClient::Commons::VariableValue.validate_raw(obj: obj.expected_result)
        SeedTraceClient::Submission::ActualResult.validate_raw(obj: obj.actual_result)
        obj.passed.is_a?(Boolean) != false || raise("Passed value for field obj.passed is not the expected type, validation failed.")
      end
    end
  end
end
