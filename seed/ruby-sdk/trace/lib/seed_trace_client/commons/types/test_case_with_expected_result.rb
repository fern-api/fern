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
        parsed_json = JSON.parse(json_object)
        if parsed_json["testCase"].nil?
          test_case = nil
        else
          test_case = parsed_json["testCase"].to_json
          test_case = Commons::TestCase.from_json(json_object: test_case)
        end
        if parsed_json["expectedResult"].nil?
          expected_result = nil
        else
          expected_result = parsed_json["expectedResult"].to_json
          expected_result = Commons::VariableValue.from_json(json_object: expected_result)
        end
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
