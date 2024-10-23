# frozen_string_literal: true

require_relative "error_info"
require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class ErroredResponse
      # @return [String]
      attr_reader :submission_id
      # @return [SeedTraceClient::Submission::ErrorInfo]
      attr_reader :error_info
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param submission_id [String]
      # @param error_info [SeedTraceClient::Submission::ErrorInfo]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::ErroredResponse]
      def initialize(submission_id:, error_info:, additional_properties: nil)
        @submission_id = submission_id
        @error_info = error_info
        @additional_properties = additional_properties
        @_field_set = { "submissionId": submission_id, "errorInfo": error_info }
      end

      # Deserialize a JSON object to an instance of ErroredResponse
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::ErroredResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        submission_id = parsed_json["submissionId"]
        if parsed_json["errorInfo"].nil?
          error_info = nil
        else
          error_info = parsed_json["errorInfo"].to_json
          error_info = SeedTraceClient::Submission::ErrorInfo.from_json(json_object: error_info)
        end
        new(
          submission_id: submission_id,
          error_info: error_info,
          additional_properties: struct
        )
      end

      # Serialize an instance of ErroredResponse to a JSON object
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
        SeedTraceClient::Submission::ErrorInfo.validate_raw(obj: obj.error_info)
      end
    end
  end
end
