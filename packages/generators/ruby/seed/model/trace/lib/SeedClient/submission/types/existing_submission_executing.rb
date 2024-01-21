# frozen_string_literal: true
require "submission/types/SubmissionId"
require "json"

module SeedClient
  module Submission
    class ExistingSubmissionExecuting
      attr_reader :submission_id, :additional_properties
      # @param submission_id [Submission::SubmissionId] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::ExistingSubmissionExecuting] 
      def initialze(submission_id:, additional_properties: nil)
        # @type [Submission::SubmissionId] 
        @submission_id = submission_id
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of ExistingSubmissionExecuting
      #
      # @param json_object [JSON] 
      # @return [Submission::ExistingSubmissionExecuting] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        submission_id = Submission::SubmissionId.from_json(json_object: struct.submissionId)
        new(submission_id: submission_id, additional_properties: struct)
      end
      # Serialize an instance of ExistingSubmissionExecuting to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 submissionId: @submission_id
}.to_json()
      end
    end
  end
end