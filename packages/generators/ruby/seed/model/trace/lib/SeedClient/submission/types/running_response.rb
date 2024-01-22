# frozen_string_literal: true
require "submission/types/SubmissionId"
require "submission/types/RunningSubmissionState"
require "json"

module SeedClient
  module Submission
    class RunningResponse
      attr_reader :submission_id, :state, :additional_properties
      # @param submission_id [Submission::SubmissionId] 
      # @param state [Submission::RunningSubmissionState] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::RunningResponse] 
      def initialze(submission_id:, state:, additional_properties: nil)
        # @type [Submission::SubmissionId] 
        @submission_id = submission_id
        # @type [Submission::RunningSubmissionState] 
        @state = state
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of RunningResponse
      #
      # @param json_object [JSON] 
      # @return [Submission::RunningResponse] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        submission_id Submission::SubmissionId.from_json(json_object: struct.submissionId)
        state Submission::RunningSubmissionState.from_json(json_object: struct.state)
        new(submission_id: submission_id, state: state, additional_properties: struct)
      end
      # Serialize an instance of RunningResponse to a JSON object
      #
      # @return [JSON] 
      def to_json
        { submissionId: @submission_id, state: @state }.to_json()
      end
      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object] 
      # @return [Void] 
      def self.validate_raw(obj:)
        SubmissionId.validate_raw(obj: obj.submission_id)
        RunningSubmissionState.validate_raw(obj: obj.state)
      end
    end
  end
end