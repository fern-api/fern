# frozen_string_literal: true
require "submission/types/SubmissionId"
require "submission/types/ErrorInfo"
require "json"

module SeedClient
  module Submission
    class ErroredResponse
      attr_reader :submission_id, :error_info, :additional_properties
      # @param submission_id [Submission::SubmissionId] 
      # @param error_info [Submission::ErrorInfo] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::ErroredResponse] 
      def initialze(submission_id:, error_info:, additional_properties: nil)
        # @type [Submission::SubmissionId] 
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
        submission_id Submission::SubmissionId.from_json(json_object: struct.submissionId)
        error_info Submission::ErrorInfo.from_json(json_object: struct.errorInfo)
        new(submission_id: submission_id, error_info: error_info, additional_properties: struct)
      end
      # Serialize an instance of ErroredResponse to a JSON object
      #
      # @return [JSON] 
      def to_json
        { submissionId: @submission_id, errorInfo: @error_info }.to_json()
      end
      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object] 
      # @return [Void] 
      def self.validate_raw(obj:)
        SubmissionId.validate_raw(obj: obj.submission_id)
        ErrorInfo.validate_raw(obj: obj.error_info)
      end
    end
  end
end