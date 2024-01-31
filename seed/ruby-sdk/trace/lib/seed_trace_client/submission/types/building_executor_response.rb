# frozen_string_literal: true

require_relative "submission_id"
require "json"

module SeedTraceClient
  module Submission
    class BuildingExecutorResponse
      attr_reader :submission_id, :status, :additional_properties

      # @param submission_id [Submission::SUBMISSION_ID]
      # @param status [Hash{String => String}]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::BuildingExecutorResponse]
      def initialize(submission_id:, status:, additional_properties: nil)
        # @type [Submission::SUBMISSION_ID]
        @submission_id = submission_id
        # @type [Hash{String => String}]
        @status = status
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of BuildingExecutorResponse
      #
      # @param json_object [JSON]
      # @return [Submission::BuildingExecutorResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        submission_id = struct.submissionId
        status = EXECUTION_SESSION_STATUS.key(struct.status)
        new(submission_id: submission_id, status: status, additional_properties: struct)
      end

      # Serialize an instance of BuildingExecutorResponse to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "submissionId": @submission_id, "status": @status }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.submission_id.is_a?(UUID) != false || raise("Passed value for field obj.submission_id is not the expected type, validation failed.")
        obj.status.is_a?(EXECUTION_SESSION_STATUS) != false || raise("Passed value for field obj.status is not the expected type, validation failed.")
      end
    end
  end
end
