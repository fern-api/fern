# frozen_string_literal: true
require "submission/types/SubmissionId"
require "json"

module SeedClient
  module Submission
    class StdoutResponse
      attr_reader :submission_id, :stdout, :additional_properties
      # @param submission_id [Submission::SubmissionId] 
      # @param stdout [String] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::StdoutResponse] 
      def initialze(submission_id:, stdout:, additional_properties: nil)
        # @type [Submission::SubmissionId] 
        @submission_id = submission_id
        # @type [String] 
        @stdout = stdout
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of StdoutResponse
      #
      # @param json_object [JSON] 
      # @return [Submission::StdoutResponse] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        submission_id = Submission::SubmissionId.from_json(json_object: struct.submissionId)
        stdout = struct.stdout
        new(submission_id: submission_id, stdout: stdout, additional_properties: struct)
      end
      # Serialize an instance of StdoutResponse to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 submissionId: @submission_id,
 stdout: @stdout
}.to_json()
      end
    end
  end
end