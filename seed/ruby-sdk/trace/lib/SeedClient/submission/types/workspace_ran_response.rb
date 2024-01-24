# frozen_string_literal: true

require_relative "submission_id"
require_relative "workspace_run_details"
require "json"

module SeedClient
  module Submission
    class WorkspaceRanResponse
      attr_reader :submission_id, :run_details, :additional_properties

      # @param submission_id [Submission::SUBMISSION_ID]
      # @param run_details [Submission::WorkspaceRunDetails]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::WorkspaceRanResponse]
      def initialize(submission_id:, run_details:, additional_properties: nil)
        # @type [Submission::SUBMISSION_ID]
        @submission_id = submission_id
        # @type [Submission::WorkspaceRunDetails]
        @run_details = run_details
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of WorkspaceRanResponse
      #
      # @param json_object [JSON]
      # @return [Submission::WorkspaceRanResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        submission_id = struct.submissionId
        run_details = struct.runDetails.to_h.to_json
        run_details = Submission::WorkspaceRunDetails.from_json(json_object: run_details)
        new(submission_id: submission_id, run_details: run_details, additional_properties: struct)
      end

      # Serialize an instance of WorkspaceRanResponse to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "submissionId": @submission_id, "runDetails": @run_details }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.submission_id.is_a?(UUID) != false || raise("Passed value for field obj.submission_id is not the expected type, validation failed.")
        Submission::WorkspaceRunDetails.validate_raw(obj: obj.run_details)
      end
    end
  end
end
