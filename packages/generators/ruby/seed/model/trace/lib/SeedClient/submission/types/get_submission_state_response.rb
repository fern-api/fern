# frozen_string_literal: true
require "commons/types/Language"
require "submission/types/SubmissionTypeState"
require "json"

module SeedClient
  module Submission
    class GetSubmissionStateResponse
      attr_reader :time_submitted, :submission, :language, :submission_type_state, :additional_properties
      # @param time_submitted [DateTime] 
      # @param submission [String] 
      # @param language [Commons::Language] 
      # @param submission_type_state [Submission::SubmissionTypeState] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::GetSubmissionStateResponse] 
      def initialze(time_submitted: nil, submission:, language:, submission_type_state:, additional_properties: nil)
        # @type [DateTime] 
        @time_submitted = time_submitted
        # @type [String] 
        @submission = submission
        # @type [Commons::Language] 
        @language = language
        # @type [Submission::SubmissionTypeState] 
        @submission_type_state = submission_type_state
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of GetSubmissionStateResponse
      #
      # @param json_object [JSON] 
      # @return [Submission::GetSubmissionStateResponse] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        time_submitted = struct.timeSubmitted
        submission = struct.submission
        language = Commons::Language.from_json(json_object: struct.language)
        submission_type_state = Submission::SubmissionTypeState.from_json(json_object: struct.submissionTypeState)
        new(time_submitted: time_submitted, submission: submission, language: language, submission_type_state: submission_type_state, additional_properties: struct)
      end
      # Serialize an instance of GetSubmissionStateResponse to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 timeSubmitted: @time_submitted,
 submission: @submission,
 language: @language,
 submissionTypeState: @submission_type_state
}.to_json()
      end
    end
  end
end