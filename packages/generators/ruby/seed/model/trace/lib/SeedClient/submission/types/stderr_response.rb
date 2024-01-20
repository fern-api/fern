# frozen_string_literal: true

require_relative "submission/types/SubmissionId"
require "json"

module SeedClient
  module Submission
    class StderrResponse
      attr_reader :submission_id, :stderr, :additional_properties

      # @param submission_id [Submission::SubmissionId]
      # @param stderr [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::StderrResponse]
      def initialze(submission_id:, stderr:, additional_properties: nil)
        # @type [Submission::SubmissionId]
        @submission_id = submission_id
        # @type [String]
        @stderr = stderr
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of StderrResponse
      #
      # @param json_object [JSON]
      # @return [Submission::StderrResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        submission_id = Submission::SubmissionId.from_json(json_object: struct.submissionId)
        stderr = struct.stderr
        new(submission_id: submission_id, stderr: stderr, additional_properties: struct)
      end

      # Serialize an instance of StderrResponse to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          submissionId: @submission_id,
          stderr: @stderr
        }.to_json
      end
    end
  end
end
