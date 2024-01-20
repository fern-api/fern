# frozen_string_literal: true

module SeedClient
  module Submission
    class TestCaseResult
      attr_reader :expected_result, :actual_result, :passed, :additional_properties

      # @param expected_result [Commons::VariableValue]
      # @param actual_result [Submission::ActualResult]
      # @param passed [Boolean]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::TestCaseResult]
      def initialze(expected_result:, actual_result:, passed:, additional_properties: nil)
        # @type [Commons::VariableValue]
        @expected_result = expected_result
        # @type [Submission::ActualResult]
        @actual_result = actual_result
        # @type [Boolean]
        @passed = passed
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of TestCaseResult
      #
      # @param json_object [JSON]
      # @return [Submission::TestCaseResult]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        expected_result = Commons::VariableValue.from_json(json_object: struct.expectedResult)
        actual_result = Submission::ActualResult.from_json(json_object: struct.actualResult)
        passed = struct.passed
        new(expected_result: expected_result, actual_result: actual_result, passed: passed,
            additional_properties: struct)
      end

      # Serialize an instance of TestCaseResult to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          expectedResult: @expected_result,
          actualResult: @actual_result,
          passed: @passed
        }.to_json
      end
    end
  end
end
