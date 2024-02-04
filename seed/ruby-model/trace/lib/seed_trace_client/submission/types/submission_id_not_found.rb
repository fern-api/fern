# frozen_string_literal: true

require_relative "submission_id"
require "json"

module SeedTraceClient
  module Submission
    class SubmissionIdNotFound
      attr_reader :missing_submission_id, :additional_properties

      # @param missing_submission_id [Submission::SUBMISSION_ID]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::SubmissionIdNotFound]
      def initialize(missing_submission_id:, additional_properties: nil)
        # @type [Submission::SUBMISSION_ID]
        @missing_submission_id = missing_submission_id
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of SubmissionIdNotFound
      #
      # @param json_object [JSON]
      # @return [Submission::SubmissionIdNotFound]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        missing_submission_id = struct.missingSubmissionId
        new(missing_submission_id: missing_submission_id, additional_properties: struct)
      end

      # Serialize an instance of SubmissionIdNotFound to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "missingSubmissionId": @missing_submission_id }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.missing_submission_id.is_a?(UUID) != false || raise("Passed value for field obj.missing_submission_id is not the expected type, validation failed.")
      end
    end
  end
end
