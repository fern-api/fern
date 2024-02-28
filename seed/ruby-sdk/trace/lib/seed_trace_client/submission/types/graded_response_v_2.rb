# frozen_string_literal: true

require_relative "submission_id"
require "json"

module SeedTraceClient
  class Submission
    class GradedResponseV2
      attr_reader :submission_id, :test_cases, :additional_properties

      # @param submission_id [Submission::SUBMISSION_ID]
      # @param test_cases [Hash{V2::Problem::TEST_CASE_ID => Submission::TestCaseGrade}]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::GradedResponseV2]
      def initialize(submission_id:, test_cases:, additional_properties: nil)
        # @type [Submission::SUBMISSION_ID]
        @submission_id = submission_id
        # @type [Hash{V2::Problem::TEST_CASE_ID => Submission::TestCaseGrade}]
        @test_cases = test_cases
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of GradedResponseV2
      #
      # @param json_object [JSON]
      # @return [Submission::GradedResponseV2]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        submission_id = struct.submissionId
        test_cases = parsed_json["testCases"]&.transform_values do |_k, v|
          v = v.to_json
          Submission::TestCaseGrade.from_json(json_object: v)
        end
        new(submission_id: submission_id, test_cases: test_cases, additional_properties: struct)
      end

      # Serialize an instance of GradedResponseV2 to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "submissionId": @submission_id, "testCases": @test_cases }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.submission_id.is_a?(UUID) != false || raise("Passed value for field obj.submission_id is not the expected type, validation failed.")
        obj.test_cases.is_a?(Hash) != false || raise("Passed value for field obj.test_cases is not the expected type, validation failed.")
      end
    end
  end
end
