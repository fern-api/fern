# frozen_string_literal: true
require "submission/types/SubmissionId"
require "json"

module SeedClient
  module Submission
    class RecordedResponseNotification
      attr_reader :submission_id, :trace_responses_size, :test_case_id, :additional_properties
      # @param submission_id [Submission::SubmissionId] 
      # @param trace_responses_size [Integer] 
      # @param test_case_id [String] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::RecordedResponseNotification] 
      def initialze(submission_id:, trace_responses_size:, test_case_id: nil, additional_properties: nil)
        # @type [Submission::SubmissionId] 
        @submission_id = submission_id
        # @type [Integer] 
        @trace_responses_size = trace_responses_size
        # @type [String] 
        @test_case_id = test_case_id
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of RecordedResponseNotification
      #
      # @param json_object [JSON] 
      # @return [Submission::RecordedResponseNotification] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        submission_id Submission::SubmissionId.from_json(json_object: struct.submissionId)
        trace_responses_size struct.traceResponsesSize
        test_case_id struct.testCaseId
        new(submission_id: submission_id, trace_responses_size: trace_responses_size, test_case_id: test_case_id, additional_properties: struct)
      end
      # Serialize an instance of RecordedResponseNotification to a JSON object
      #
      # @return [JSON] 
      def to_json
        { submissionId: @submission_id, traceResponsesSize: @trace_responses_size, testCaseId: @test_case_id }.to_json()
      end
      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object] 
      # @return [Void] 
      def self.validate_raw(obj:)
        SubmissionId.validate_raw(obj: obj.submission_id)
        obj.trace_responses_size.is_a?(Integer) != false || raise("Passed value for field obj.trace_responses_size is not the expected type, validation failed.")
        obj.test_case_id&.is_a?(String) != false || raise("Passed value for field obj.test_case_id is not the expected type, validation failed.")
      end
    end
  end
end