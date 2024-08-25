# frozen_string_literal: true

require_relative "workspace_run_details"
require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class WorkspaceRanResponse
      # @return [String]
      attr_reader :submission_id
      # @return [SeedTraceClient::Submission::WorkspaceRunDetails]
      attr_reader :run_details
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param submission_id [String]
      # @param run_details [SeedTraceClient::Submission::WorkspaceRunDetails]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::WorkspaceRanResponse]
      def initialize(submission_id:, run_details:, additional_properties: nil)
        @submission_id = submission_id
        @run_details = run_details
        @additional_properties = additional_properties
        @_field_set = { "submissionId": submission_id, "runDetails": run_details }
      end

      # Deserialize a JSON object to an instance of WorkspaceRanResponse
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::WorkspaceRanResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        submission_id = parsed_json["submissionId"]
        if parsed_json["runDetails"].nil?
          run_details = nil
        else
          run_details = parsed_json["runDetails"].to_json
          run_details = SeedTraceClient::Submission::WorkspaceRunDetails.from_json(json_object: run_details)
        end
        new(
          submission_id: submission_id,
          run_details: run_details,
          additional_properties: struct
        )
      end

      # Serialize an instance of WorkspaceRanResponse to a JSON object
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
        SeedTraceClient::Submission::WorkspaceRunDetails.validate_raw(obj: obj.run_details)
      end
    end
  end
end
