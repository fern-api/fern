# frozen_string_literal: true

require_relative "../../commons/types/language"
require_relative "submission_file_info"
require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class SubmitRequestV2
      # @return [String]
      attr_reader :submission_id
      # @return [SeedTraceClient::Commons::Language]
      attr_reader :language
      # @return [Array<SeedTraceClient::Submission::SubmissionFileInfo>]
      attr_reader :submission_files
      # @return [String]
      attr_reader :problem_id
      # @return [Integer]
      attr_reader :problem_version
      # @return [String]
      attr_reader :user_id
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param submission_id [String]
      # @param language [SeedTraceClient::Commons::Language]
      # @param submission_files [Array<SeedTraceClient::Submission::SubmissionFileInfo>]
      # @param problem_id [String]
      # @param problem_version [Integer]
      # @param user_id [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::SubmitRequestV2]
      def initialize(submission_id:, language:, submission_files:, problem_id:, problem_version: OMIT, user_id: OMIT,
                     additional_properties: nil)
        @submission_id = submission_id
        @language = language
        @submission_files = submission_files
        @problem_id = problem_id
        @problem_version = problem_version if problem_version != OMIT
        @user_id = user_id if user_id != OMIT
        @additional_properties = additional_properties
        @_field_set = {
          "submissionId": submission_id,
          "language": language,
          "submissionFiles": submission_files,
          "problemId": problem_id,
          "problemVersion": problem_version,
          "userId": user_id
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of SubmitRequestV2
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::SubmitRequestV2]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        submission_id = parsed_json["submissionId"]
        language = parsed_json["language"]
        submission_files = parsed_json["submissionFiles"]&.map do |item|
          item = item.to_json
          SeedTraceClient::Submission::SubmissionFileInfo.from_json(json_object: item)
        end
        problem_id = parsed_json["problemId"]
        problem_version = parsed_json["problemVersion"]
        user_id = parsed_json["userId"]
        new(
          submission_id: submission_id,
          language: language,
          submission_files: submission_files,
          problem_id: problem_id,
          problem_version: problem_version,
          user_id: user_id,
          additional_properties: struct
        )
      end

      # Serialize an instance of SubmitRequestV2 to a JSON object
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
        obj.language.is_a?(SeedTraceClient::Commons::Language) != false || raise("Passed value for field obj.language is not the expected type, validation failed.")
        obj.submission_files.is_a?(Array) != false || raise("Passed value for field obj.submission_files is not the expected type, validation failed.")
        obj.problem_id.is_a?(String) != false || raise("Passed value for field obj.problem_id is not the expected type, validation failed.")
        obj.problem_version&.is_a?(Integer) != false || raise("Passed value for field obj.problem_version is not the expected type, validation failed.")
        obj.user_id&.is_a?(String) != false || raise("Passed value for field obj.user_id is not the expected type, validation failed.")
      end
    end
  end
end
