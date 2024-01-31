# frozen_string_literal: true

require_relative "submission_id"
require_relative "error_info"
require "json"

module SeedTraceClient
  module Submission
    class ErroredResponse
      attr_reader :submission_id, :error_info, :additional_properties

      # @param submission_id [Submission::SUBMISSION_ID]
      # @param error_info [Submission::ErrorInfo]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::ErroredResponse]
      def initialize(submission_id:, error_info:, additional_properties: nil)
        # @type [Submission::SUBMISSION_ID]
        @submission_id = submission_id
        # @type [Submission::ErrorInfo]
        @error_info = error_info
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of ErroredResponse
      #
      # @param json_object [JSON]
      # @return [Submission::ErroredResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        submission_id = struct.submissionId
        error_info = struct.errorInfo.to_h.to_json
        error_info = Submission::ErrorInfo.from_json(json_object: error_info)
        new(submission_id: submission_id, error_info: error_info, additional_properties: struct)
      end

      # Serialize an instance of ErroredResponse to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "submissionId": @submission_id, "errorInfo": @error_info }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.submission_id.is_a?(UUID) != false || raise("Passed value for field obj.submission_id is not the expected type, validation failed.")
        Submission::ErrorInfo.validate_raw(obj: obj.error_info)
      end
    end
  end
end
