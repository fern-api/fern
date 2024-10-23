# frozen_string_literal: true

require_relative "../../commons/types/test_case"
require_relative "test_submission_status"
require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class TestSubmissionState
      # @return [String]
      attr_reader :problem_id
      # @return [Array<SeedTraceClient::Commons::TestCase>]
      attr_reader :default_test_cases
      # @return [Array<SeedTraceClient::Commons::TestCase>]
      attr_reader :custom_test_cases
      # @return [SeedTraceClient::Submission::TestSubmissionStatus]
      attr_reader :status
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param problem_id [String]
      # @param default_test_cases [Array<SeedTraceClient::Commons::TestCase>]
      # @param custom_test_cases [Array<SeedTraceClient::Commons::TestCase>]
      # @param status [SeedTraceClient::Submission::TestSubmissionStatus]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::TestSubmissionState]
      def initialize(problem_id:, default_test_cases:, custom_test_cases:, status:, additional_properties: nil)
        @problem_id = problem_id
        @default_test_cases = default_test_cases
        @custom_test_cases = custom_test_cases
        @status = status
        @additional_properties = additional_properties
        @_field_set = {
          "problemId": problem_id,
          "defaultTestCases": default_test_cases,
          "customTestCases": custom_test_cases,
          "status": status
        }
      end

      # Deserialize a JSON object to an instance of TestSubmissionState
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::TestSubmissionState]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        problem_id = parsed_json["problemId"]
        default_test_cases = parsed_json["defaultTestCases"]&.map do |item|
          item = item.to_json
          SeedTraceClient::Commons::TestCase.from_json(json_object: item)
        end
        custom_test_cases = parsed_json["customTestCases"]&.map do |item|
          item = item.to_json
          SeedTraceClient::Commons::TestCase.from_json(json_object: item)
        end
        if parsed_json["status"].nil?
          status = nil
        else
          status = parsed_json["status"].to_json
          status = SeedTraceClient::Submission::TestSubmissionStatus.from_json(json_object: status)
        end
        new(
          problem_id: problem_id,
          default_test_cases: default_test_cases,
          custom_test_cases: custom_test_cases,
          status: status,
          additional_properties: struct
        )
      end

      # Serialize an instance of TestSubmissionState to a JSON object
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
        obj.problem_id.is_a?(String) != false || raise("Passed value for field obj.problem_id is not the expected type, validation failed.")
        obj.default_test_cases.is_a?(Array) != false || raise("Passed value for field obj.default_test_cases is not the expected type, validation failed.")
        obj.custom_test_cases.is_a?(Array) != false || raise("Passed value for field obj.custom_test_cases is not the expected type, validation failed.")
        SeedTraceClient::Submission::TestSubmissionStatus.validate_raw(obj: obj.status)
      end
    end
  end
end
