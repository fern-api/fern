# frozen_string_literal: true
require_relative "submission/types/SubmissionId"
require "json"

module SeedClient
  module Submission
    class GradedResponseV2
      attr_reader :submission_id, :test_cases, :additional_properties
      # @param submission_id [Submission::SubmissionId] 
      # @param test_cases [Hash{V2::Problem::TestCaseId => V2::Problem::TestCaseId}] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::GradedResponseV2] 
      def initialze(submission_id:, test_cases:, additional_properties: nil)
        # @type [Submission::SubmissionId] 
        @submission_id = submission_id
        # @type [Hash{V2::Problem::TestCaseId => V2::Problem::TestCaseId}] 
        @test_cases = test_cases
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of GradedResponseV2
      #
      # @param json_object [JSON] 
      # @return [Submission::GradedResponseV2] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        submission_id = Submission::SubmissionId.from_json(json_object: struct.submissionId)
        test_cases = struct.testCases.transform_values() do | v |
 V2::Problem::TestCaseId.from_json(json_object: v)
end
        new(submission_id: submission_id, test_cases: test_cases, additional_properties: struct)
      end
      # Serialize an instance of GradedResponseV2 to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 submissionId: @submission_id,
 testCases: @test_cases.transform_values() do | v |\n V2::Problem::TestCaseId.from_json(json_object: v)\nend
}.to_json()
      end
    end
  end
end