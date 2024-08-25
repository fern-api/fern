# frozen_string_literal: true

require "date"
require_relative "../../commons/types/language"
require_relative "submission_type_state"
require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class GetSubmissionStateResponse
      # @return [DateTime]
      attr_reader :time_submitted
      # @return [String]
      attr_reader :submission
      # @return [SeedTraceClient::Commons::Language]
      attr_reader :language
      # @return [SeedTraceClient::Submission::SubmissionTypeState]
      attr_reader :submission_type_state
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param time_submitted [DateTime]
      # @param submission [String]
      # @param language [SeedTraceClient::Commons::Language]
      # @param submission_type_state [SeedTraceClient::Submission::SubmissionTypeState]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::GetSubmissionStateResponse]
      def initialize(submission:, language:, submission_type_state:, time_submitted: OMIT, additional_properties: nil)
        @time_submitted = time_submitted if time_submitted != OMIT
        @submission = submission
        @language = language
        @submission_type_state = submission_type_state
        @additional_properties = additional_properties
        @_field_set = {
          "timeSubmitted": time_submitted,
          "submission": submission,
          "language": language,
          "submissionTypeState": submission_type_state
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of GetSubmissionStateResponse
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::GetSubmissionStateResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        time_submitted = (DateTime.parse(parsed_json["timeSubmitted"]) unless parsed_json["timeSubmitted"].nil?)
        submission = parsed_json["submission"]
        language = parsed_json["language"]
        if parsed_json["submissionTypeState"].nil?
          submission_type_state = nil
        else
          submission_type_state = parsed_json["submissionTypeState"].to_json
          submission_type_state = SeedTraceClient::Submission::SubmissionTypeState.from_json(json_object: submission_type_state)
        end
        new(
          time_submitted: time_submitted,
          submission: submission,
          language: language,
          submission_type_state: submission_type_state,
          additional_properties: struct
        )
      end

      # Serialize an instance of GetSubmissionStateResponse to a JSON object
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
        obj.time_submitted&.is_a?(DateTime) != false || raise("Passed value for field obj.time_submitted is not the expected type, validation failed.")
        obj.submission.is_a?(String) != false || raise("Passed value for field obj.submission is not the expected type, validation failed.")
        obj.language.is_a?(SeedTraceClient::Commons::Language) != false || raise("Passed value for field obj.language is not the expected type, validation failed.")
        SeedTraceClient::Submission::SubmissionTypeState.validate_raw(obj: obj.submission_type_state)
      end
    end
  end
end
