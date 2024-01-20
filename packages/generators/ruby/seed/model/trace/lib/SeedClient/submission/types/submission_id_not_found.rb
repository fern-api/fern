# frozen_string_literal: true

module SeedClient
  module Submission
    class SubmissionIdNotFound
      attr_reader :missing_submission_id, :additional_properties

      # @param missing_submission_id [Submission::SubmissionId]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::SubmissionIdNotFound]
      def initialze(missing_submission_id:, additional_properties: nil)
        # @type [Submission::SubmissionId]
        @missing_submission_id = missing_submission_id
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of SubmissionIdNotFound
      #
      # @param json_object [JSON]
      # @return [Submission::SubmissionIdNotFound]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        missing_submission_id = Submission::SubmissionId.from_json(json_object: struct.missingSubmissionId)
        new(missing_submission_id: missing_submission_id, additional_properties: struct)
      end

      # Serialize an instance of SubmissionIdNotFound to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          missingSubmissionId: @missing_submission_id
        }.to_json
      end
    end
  end
end
