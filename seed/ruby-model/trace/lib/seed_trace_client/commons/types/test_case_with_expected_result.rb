# frozen_string_literal: true

require_relative "test_case"
require_relative "variable_value"
require "json"

module SeedTraceClient
  module Commons
    class TestCaseWithExpectedResult
      attr_reader :test_case, :expected_result, :additional_properties

      # @param test_case [Commons::TestCase]
      # @param expected_result [Commons::VariableValue]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Commons::TestCaseWithExpectedResult]
      def initialize(test_case:, expected_result:, additional_properties: nil)
        # @type [Commons::TestCase]
        @test_case = test_case
        # @type [Commons::VariableValue]
        @expected_result = expected_result
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of TestCaseWithExpectedResult
      #
      # @param json_object [JSON]
      # @return [Commons::TestCaseWithExpectedResult]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        test_case = struct.testCase
        expected_result = struct.expectedResult
        new(test_case: test_case, expected_result: expected_result, additional_properties: struct)
      end

      # Serialize an instance of TestCaseWithExpectedResult to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "testCase": @test_case, "expectedResult": @expected_result }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        Commons::TestCase.validate_raw(obj: obj.test_case)
        Commons::VariableValue.validate_raw(obj: obj.expected_result)
      end
    end
  end
end
