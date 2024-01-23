# frozen_string_literal: true

require_relative "../../commons/types/problem_id"
require_relative "../../commons/types/test_case"
require_relative "test_submission_status"
require "json"

module SeedClient
  module Submission
    class TestSubmissionState
      attr_reader :problem_id, :default_test_cases, :custom_test_cases, :status, :additional_properties

      # @param problem_id [Commons::PROBLEM_ID]
      # @param default_test_cases [Array<Commons::TestCase>]
      # @param custom_test_cases [Array<Commons::TestCase>]
      # @param status [Submission::TestSubmissionStatus]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::TestSubmissionState]
      def initialize(problem_id:, default_test_cases:, custom_test_cases:, status:, additional_properties: nil)
        # @type [Commons::PROBLEM_ID]
        @problem_id = problem_id
        # @type [Array<Commons::TestCase>]
        @default_test_cases = default_test_cases
        # @type [Array<Commons::TestCase>]
        @custom_test_cases = custom_test_cases
        # @type [Submission::TestSubmissionStatus]
        @status = status
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of TestSubmissionState
      #
      # @param json_object [JSON]
      # @return [Submission::TestSubmissionState]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        problem_id = struct.problemId
        default_test_cases = struct.defaultTestCases.map do |v|
          v = v.to_h.to_json
          Commons::TestCase.from_json(json_object: v)
        end
        custom_test_cases = struct.customTestCases.map do |v|
          v = v.to_h.to_json
          Commons::TestCase.from_json(json_object: v)
        end
        status = struct.status.to_h.to_json
        status = Submission::TestSubmissionStatus.from_json(json_object: status)
        new(problem_id: problem_id, default_test_cases: default_test_cases, custom_test_cases: custom_test_cases,
            status: status, additional_properties: struct)
      end

      # Serialize an instance of TestSubmissionState to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          "problemId": @problem_id,
          "defaultTestCases": @default_test_cases,
          "customTestCases": @custom_test_cases,
          "status": @status
        }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.problem_id.is_a?(String) != false || raise("Passed value for field obj.problem_id is not the expected type, validation failed.")
        obj.default_test_cases.is_a?(Array) != false || raise("Passed value for field obj.default_test_cases is not the expected type, validation failed.")
        obj.custom_test_cases.is_a?(Array) != false || raise("Passed value for field obj.custom_test_cases is not the expected type, validation failed.")
        Submission::TestSubmissionStatus.validate_raw(obj: obj.status)
      end
    end
  end
end
