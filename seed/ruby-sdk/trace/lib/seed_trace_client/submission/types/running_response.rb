# frozen_string_literal: true

require_relative "submission_id"
require_relative "running_submission_state"
require "json"

module SeedTraceClient
  class Submission
    class RunningResponse
      attr_reader :submission_id, :state, :additional_properties

      # @param submission_id [Submission::SUBMISSION_ID]
      # @param state [Submission::RunningSubmissionState]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::RunningResponse]
      def initialize(submission_id:, state:, additional_properties: nil)
        # @type [Submission::SUBMISSION_ID]
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
        JSON.parse(json_object)
        submission_id = struct.submissionId
        state = struct.state
        new(submission_id: submission_id, state: state, additional_properties: struct)
      end

      # Serialize an instance of RunningResponse to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "submissionId": @submission_id, "state": @state }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.submission_id.is_a?(UUID) != false || raise("Passed value for field obj.submission_id is not the expected type, validation failed.")
        obj.state.is_a?(Submission::RunningSubmissionState) != false || raise("Passed value for field obj.state is not the expected type, validation failed.")
      end
    end
  end
end
