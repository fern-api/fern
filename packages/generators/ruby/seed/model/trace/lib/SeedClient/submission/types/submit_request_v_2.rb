# frozen_string_literal: true
require "submission/types/SubmissionId"
require "commons/types/Language"
require "submission/types/SubmissionFileInfo"
require "commons/types/ProblemId"
require "json"

module SeedClient
  module Submission
    class SubmitRequestV2
      attr_reader :submission_id, :language, :submission_files, :problem_id, :problem_version, :user_id, :additional_properties
      # @param submission_id [Submission::SubmissionId] 
      # @param language [Commons::Language] 
      # @param submission_files [Array<Submission::SubmissionFileInfo>] 
      # @param problem_id [Commons::ProblemId] 
      # @param problem_version [Integer] 
      # @param user_id [String] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::SubmitRequestV2] 
      def initialze(submission_id:, language:, submission_files:, problem_id:, problem_version: nil, user_id: nil, additional_properties: nil)
        # @type [Submission::SubmissionId] 
        @submission_id = submission_id
        # @type [Commons::Language] 
        @language = language
        # @type [Array<Submission::SubmissionFileInfo>] 
        @submission_files = submission_files
        # @type [Commons::ProblemId] 
        @problem_id = problem_id
        # @type [Integer] 
        @problem_version = problem_version
        # @type [String] 
        @user_id = user_id
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of SubmitRequestV2
      #
      # @param json_object [JSON] 
      # @return [Submission::SubmitRequestV2] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        submission_id = Submission::SubmissionId.from_json(json_object: struct.submissionId)
        language = Commons::Language.from_json(json_object: struct.language)
        submission_files = struct.submissionFiles.map() do | v |
 Submission::SubmissionFileInfo.from_json(json_object: v)
end
        problem_id = Commons::ProblemId.from_json(json_object: struct.problemId)
        problem_version = struct.problemVersion
        user_id = struct.userId
        new(submission_id: submission_id, language: language, submission_files: submission_files, problem_id: problem_id, problem_version: problem_version, user_id: user_id, additional_properties: struct)
      end
      # Serialize an instance of SubmitRequestV2 to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 submissionId: @submission_id,
 language: @language,
 submissionFiles: @submission_files,
 problemId: @problem_id,
 problemVersion: @problem_version,
 userId: @user_id
}.to_json()
      end
    end
  end
end