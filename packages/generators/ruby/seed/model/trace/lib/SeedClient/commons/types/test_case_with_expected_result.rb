# frozen_string_literal: true

module SeedClient
  module Commons
    class TestCaseWithExpectedResult
      attr_reader :test_case, :expected_result, :additional_properties

      # @param test_case [Commons::TestCase]
      # @param expected_result [Commons::VariableValue]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Commons::TestCaseWithExpectedResult]
      def initialze(test_case:, expected_result:, additional_properties: nil)
        # @type [Commons::TestCase]
        @test_case = test_case
        # @type [Commons::VariableValue]
        @expected_result = expected_result
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of TestCaseWithExpectedResult
      #
      # @param json_object [JSON]
      # @return [Commons::TestCaseWithExpectedResult]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        test_case = Commons::TestCase.from_json(json_object: struct.testCase)
        expected_result = Commons::VariableValue.from_json(json_object: struct.expectedResult)
        new(test_case: test_case, expected_result: expected_result, additional_properties: struct)
      end

      # Serialize an instance of TestCaseWithExpectedResult to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          testCase: @test_case,
          expectedResult: @expected_result
        }.to_json
      end
    end
  end
end
