# frozen_string_literal: true

require_relative "../../commons/types/language"
require_relative "submission_file_info"
require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class WorkspaceSubmitRequest
      attr_reader :submission_id, :language, :submission_files, :user_id, :additional_properties, :_field_set
      protected :_field_set
      OMIT = Object.new
      # @param submission_id [String]
      # @param language [SeedTraceClient::Commons::Language]
      # @param submission_files [Array<SeedTraceClient::Submission::SubmissionFileInfo>]
      # @param user_id [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::WorkspaceSubmitRequest]
      def initialize(submission_id:, language:, submission_files:, user_id: OMIT, additional_properties: nil)
        # @type [String]
        @submission_id = submission_id
        # @type [SeedTraceClient::Commons::Language]
        @language = language
        # @type [Array<SeedTraceClient::Submission::SubmissionFileInfo>]
        @submission_files = submission_files
        # @type [String]
        @user_id = user_id if user_id != OMIT
        @_field_set = {
          "submissionId": @submission_id,
          "language": @language,
          "submissionFiles": @submission_files,
          "userId": @user_id
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of WorkspaceSubmitRequest
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::WorkspaceSubmitRequest]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        submission_id = struct["submissionId"]
        language = struct["language"]
        submission_files = parsed_json["submissionFiles"]&.map do |v|
          v = v.to_json
          SeedTraceClient::Submission::SubmissionFileInfo.from_json(json_object: v)
        end
        user_id = struct["userId"]
        new(submission_id: submission_id, language: language, submission_files: submission_files, user_id: user_id,
            additional_properties: struct)
      end

      # Serialize an instance of WorkspaceSubmitRequest to a JSON object
      #
      # @return [String]
      def to_json(*_args)
        @_field_set&.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.submission_id.is_a?(String) != false || raise("Passed value for field obj.submission_id is not the expected type, validation failed.")
        obj.language.is_a?(SeedTraceClient::Commons::Language) != false || raise("Passed value for field obj.language is not the expected type, validation failed.")
        obj.submission_files.is_a?(Array) != false || raise("Passed value for field obj.submission_files is not the expected type, validation failed.")
        obj.user_id&.is_a?(String) != false || raise("Passed value for field obj.user_id is not the expected type, validation failed.")
      end
    end
  end
end
