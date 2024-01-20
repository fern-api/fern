# frozen_string_literal: true

module SeedClient
  module Submission
    class BuildingExecutorResponse
      attr_reader :submission_id, :status, :additional_properties

      # @param submission_id [Submission::SubmissionId]
      # @param status [Submission::ExecutionSessionStatus]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::BuildingExecutorResponse]
      def initialze(submission_id:, status:, additional_properties: nil)
        # @type [Submission::SubmissionId]
        @submission_id = submission_id
        # @type [Submission::ExecutionSessionStatus]
        @status = status
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of BuildingExecutorResponse
      #
      # @param json_object [JSON]
      # @return [Submission::BuildingExecutorResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        submission_id = Submission::SubmissionId.from_json(json_object: struct.submissionId)
        status = Submission::ExecutionSessionStatus.from_json(json_object: struct.status)
        new(submission_id: submission_id, status: status, additional_properties: struct)
      end

      # Serialize an instance of BuildingExecutorResponse to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          submissionId: @submission_id,
          status: @status
        }.to_json
      end
    end
  end
end
