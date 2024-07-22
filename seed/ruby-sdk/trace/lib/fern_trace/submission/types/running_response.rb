# frozen_string_literal: true

require_relative "running_submission_state"
require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class RunningResponse
      # @return [String]
      attr_reader :submission_id
      # @return [SeedTraceClient::Submission::RunningSubmissionState]
      attr_reader :state
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param submission_id [String]
      # @param state [SeedTraceClient::Submission::RunningSubmissionState]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::RunningResponse]
      def initialize(submission_id:, state:, additional_properties: nil)
        @submission_id = submission_id
        @state = state
        @additional_properties = additional_properties
        @_field_set = { "submissionId": submission_id, "state": state }
      end

      # Deserialize a JSON object to an instance of RunningResponse
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::RunningResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        submission_id = parsed_json["submissionId"]
        state = parsed_json["state"]
        new(
          submission_id: submission_id,
          state: state,
          additional_properties: struct
        )
      end

      # Serialize an instance of RunningResponse to a JSON object
      #
      # @return [String]
      def to_json(*_args)
        @_field_set&.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given
      #  hash and check each fields type against the current object's property
      #  definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.submission_id.is_a?(String) != false || raise("Passed value for field obj.submission_id is not the expected type, validation failed.")
        obj.state.is_a?(SeedTraceClient::Submission::RunningSubmissionState) != false || raise("Passed value for field obj.state is not the expected type, validation failed.")
      end
    end
  end
end
