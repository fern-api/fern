# frozen_string_literal: true

require_relative "submission/types/SubmissionId"
require_relative "submission/types/WorkspaceRunDetails"
require "json"

module SeedClient
  module Submission
    class WorkspaceRanResponse
      attr_reader :submission_id, :run_details, :additional_properties

      # @param submission_id [Submission::SubmissionId]
      # @param run_details [Submission::WorkspaceRunDetails]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::WorkspaceRanResponse]
      def initialze(submission_id:, run_details:, additional_properties: nil)
        # @type [Submission::SubmissionId]
        @submission_id = submission_id
        # @type [Submission::WorkspaceRunDetails]
        @run_details = run_details
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of WorkspaceRanResponse
      #
      # @param json_object [JSON]
      # @return [Submission::WorkspaceRanResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        submission_id = Submission::SubmissionId.from_json(json_object: struct.submissionId)
        run_details = Submission::WorkspaceRunDetails.from_json(json_object: struct.runDetails)
        new(submission_id: submission_id, run_details: run_details, additional_properties: struct)
      end

      # Serialize an instance of WorkspaceRanResponse to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          submissionId: @submission_id,
          runDetails: @run_details
        }.to_json
      end
    end
  end
end
