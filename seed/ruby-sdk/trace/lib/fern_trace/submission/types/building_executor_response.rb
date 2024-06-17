# frozen_string_literal: true

require_relative "execution_session_status"
require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class BuildingExecutorResponse
      # @return [String]
      attr_reader :submission_id
      # @return [ExecutionSessionStatus]
      attr_reader :status
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param submission_id [String]
      # @param status [ExecutionSessionStatus]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [BuildingExecutorResponse]
      def initialize(submission_id:, status:, additional_properties: nil)
        @submission_id = submission_id
        @status = status
        @additional_properties = additional_properties
        @_field_set = { "submissionId": submission_id, "status": status }
      end

      # Deserialize a JSON object to an instance of BuildingExecutorResponse
      #
      # @param json_object [String]
      # @return [BuildingExecutorResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        submission_id = struct["submissionId"]
        status = struct["status"]
        new(
          submission_id: submission_id,
          status: status,
          additional_properties: struct
        )
      end

      # Serialize an instance of BuildingExecutorResponse to a JSON object
      #
      # @return [String]
      def to_json(*_args)
        @_field_set&.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given
      #  hash and check each fields type against the current object's property
      #  definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.submission_id.is_a?(String) != false || raise("Passed value for field obj.submission_id is not the expected type, validation failed.")
        obj.status.is_a?(ExecutionSessionStatus) != false || raise("Passed value for field obj.status is not the expected type, validation failed.")
      end
    end
  end
end
