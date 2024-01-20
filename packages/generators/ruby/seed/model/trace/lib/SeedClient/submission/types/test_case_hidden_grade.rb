# frozen_string_literal: true

module SeedClient
  module Submission
    class TestCaseHiddenGrade
      attr_reader :passed, :additional_properties

      # @param passed [Boolean]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::TestCaseHiddenGrade]
      def initialze(passed:, additional_properties: nil)
        # @type [Boolean]
        @passed = passed
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of TestCaseHiddenGrade
      #
      # @param json_object [JSON]
      # @return [Submission::TestCaseHiddenGrade]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        passed = struct.passed
        new(passed: passed, additional_properties: struct)
      end

      # Serialize an instance of TestCaseHiddenGrade to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          passed: @passed
        }.to_json
      end
    end
  end
end
