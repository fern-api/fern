# frozen_string_literal: true

require_relative "submission/types/SUBMISSION_ID"
require_relative "submission/types/SubmissionFileInfo"
require "json"

module SeedClient
  module Submission
    class WorkspaceSubmitRequest
      attr_reader :submission_id, :language, :submission_files, :user_id, :additional_properties

      # @param submission_id [Submission::SUBMISSION_ID]
      # @param language [Hash{String => String}]
      # @param submission_files [Array<Submission::SubmissionFileInfo>]
      # @param user_id [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::WorkspaceSubmitRequest]
      def initialze(submission_id:, language:, submission_files:, user_id: nil, additional_properties: nil)
        # @type [Submission::SUBMISSION_ID]
        @submission_id = submission_id
        # @type [Hash{String => String}]
        @language = language
        # @type [Array<Submission::SubmissionFileInfo>]
        @submission_files = submission_files
        # @type [String]
        @user_id = user_id
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of WorkspaceSubmitRequest
      #
      # @param json_object [JSON]
      # @return [Submission::WorkspaceSubmitRequest]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        submission_id = struct.submissionId
        language = LANGUAGE.key(struct.language)
        submission_files = struct.submissionFiles.map do |v|
          Submission::SubmissionFileInfo.from_json(json_object: v)
        end
        user_id = struct.userId
        new(submission_id: submission_id, language: language, submission_files: submission_files, user_id: user_id,
            additional_properties: struct)
      end

      # Serialize an instance of WorkspaceSubmitRequest to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "submissionId": @submission_id, "language": @language.fetch, "submissionFiles": @submission_files,
          "userId": @user_id }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.submission_id.is_a?(UUID) != false || raise("Passed value for field obj.submission_id is not the expected type, validation failed.")
        obj.language.is_a?(LANGUAGE) != false || raise("Passed value for field obj.language is not the expected type, validation failed.")
        obj.submission_files.is_a?(Array) != false || raise("Passed value for field obj.submission_files is not the expected type, validation failed.")
        obj.user_id&.is_a?(String) != false || raise("Passed value for field obj.user_id is not the expected type, validation failed.")
      end
    end
  end
end
