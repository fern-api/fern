# frozen_string_literal: true

require_relative "submission/types/SUBMISSION_ID"
require "json"

module SeedClient
  module Submission
    class StdoutResponse
      attr_reader :submission_id, :stdout, :additional_properties

      # @param submission_id [Submission::SUBMISSION_ID]
      # @param stdout [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::StdoutResponse]
      def initialze(submission_id:, stdout:, additional_properties: nil)
        # @type [Submission::SUBMISSION_ID]
        @submission_id = submission_id
        # @type [String]
        @stdout = stdout
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of StdoutResponse
      #
      # @param json_object [JSON]
      # @return [Submission::StdoutResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        submission_id = struct.submissionId
        stdout = struct.stdout
        new(submission_id: submission_id, stdout: stdout, additional_properties: struct)
      end

      # Serialize an instance of StdoutResponse to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "submissionId": @submission_id, "stdout": @stdout }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.submission_id.is_a?(UUID) != false || raise("Passed value for field obj.submission_id is not the expected type, validation failed.")
        obj.stdout.is_a?(String) != false || raise("Passed value for field obj.stdout is not the expected type, validation failed.")
      end
    end
  end
end
