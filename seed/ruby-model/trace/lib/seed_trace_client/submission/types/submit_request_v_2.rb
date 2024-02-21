# frozen_string_literal: true

require_relative "submission_id"
require_relative "../../commons/types/language"
require_relative "submission_file_info"
require_relative "../../commons/types/problem_id"
require "json"

module SeedTraceClient
  class Submission
    class SubmitRequestV2
      attr_reader :submission_id, :language, :submission_files, :problem_id, :problem_version, :user_id,
                  :additional_properties

      # @param submission_id [Submission::SUBMISSION_ID]
      # @param language [Commons::Language]
      # @param submission_files [Array<Submission::SubmissionFileInfo>]
      # @param problem_id [Commons::PROBLEM_ID]
      # @param problem_version [Integer]
      # @param user_id [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::SubmitRequestV2]
      def initialize(submission_id:, language:, submission_files:, problem_id:, problem_version: nil, user_id: nil,
                     additional_properties: nil)
        # @type [Submission::SUBMISSION_ID]
        @submission_id = submission_id
        # @type [Commons::Language]
        @language = language
        # @type [Array<Submission::SubmissionFileInfo>]
        @submission_files = submission_files
        # @type [Commons::PROBLEM_ID]
        @problem_id = problem_id
        # @type [Integer]
        @problem_version = problem_version
        # @type [String]
        @user_id = user_id
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of SubmitRequestV2
      #
      # @param json_object [JSON]
      # @return [Submission::SubmitRequestV2]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        submission_id = struct.submissionId
        language = struct.language
        submission_files = parsed_json["submissionFiles"]&.map do |v|
          v = v.to_json
          Submission::SubmissionFileInfo.from_json(json_object: v)
        end
        problem_id = struct.problemId
        problem_version = struct.problemVersion
        user_id = struct.userId
        new(submission_id: submission_id, language: language, submission_files: submission_files,
            problem_id: problem_id, problem_version: problem_version, user_id: user_id, additional_properties: struct)
      end

      # Serialize an instance of SubmitRequestV2 to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          "submissionId": @submission_id,
          "language": @language,
          "submissionFiles": @submission_files,
          "problemId": @problem_id,
          "problemVersion": @problem_version,
          "userId": @user_id
        }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.submission_id.is_a?(UUID) != false || raise("Passed value for field obj.submission_id is not the expected type, validation failed.")
        obj.language.is_a?(Commons::Language) != false || raise("Passed value for field obj.language is not the expected type, validation failed.")
        obj.submission_files.is_a?(Array) != false || raise("Passed value for field obj.submission_files is not the expected type, validation failed.")
        obj.problem_id.is_a?(String) != false || raise("Passed value for field obj.problem_id is not the expected type, validation failed.")
        obj.problem_version&.is_a?(Integer) != false || raise("Passed value for field obj.problem_version is not the expected type, validation failed.")
        obj.user_id&.is_a?(String) != false || raise("Passed value for field obj.user_id is not the expected type, validation failed.")
      end
    end
  end
end
