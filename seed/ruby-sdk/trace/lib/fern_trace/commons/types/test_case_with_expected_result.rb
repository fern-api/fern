# frozen_string_literal: true

require_relative "test_case"
require_relative "variable_value"
require "ostruct"
require "json"

module SeedTraceClient
  class Commons
    class TestCaseWithExpectedResult
      # @return [TestCase]
      attr_reader :test_case
      # @return [VariableValue]
      attr_reader :expected_result
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param test_case [TestCase]
      # @param expected_result [VariableValue]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [TestCaseWithExpectedResult]
      def initialize(test_case:, expected_result:, additional_properties: nil)
        @test_case = test_case
        @expected_result = expected_result
        @additional_properties = additional_properties
        @_field_set = { "testCase": test_case, "expectedResult": expected_result }
      end

      # Deserialize a JSON object to an instance of TestCaseWithExpectedResult
      #
      # @param json_object [String]
      # @return [TestCaseWithExpectedResult]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["testCase"].nil?
          test_case = nil
        else
          test_case = parsed_json["testCase"].to_json
          test_case = TestCase.from_json(json_object: test_case)
        end
        if parsed_json["expectedResult"].nil?
          expected_result = nil
        else
          expected_result = parsed_json["expectedResult"].to_json
          expected_result = VariableValue.from_json(json_object: expected_result)
        end
        new(
          test_case: test_case,
          expected_result: expected_result,
          additional_properties: struct
        )
      end

      # Serialize an instance of TestCaseWithExpectedResult to a JSON object
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
        TestCase.validate_raw(obj: obj.test_case)
        VariableValue.validate_raw(obj: obj.expected_result)
      end
    end
  end
end
