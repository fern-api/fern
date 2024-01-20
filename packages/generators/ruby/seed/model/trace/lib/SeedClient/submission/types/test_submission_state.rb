# frozen_string_literal: true

module SeedClient
  module Submission
    class TestSubmissionState
      attr_reader :problem_id, :default_test_cases, :custom_test_cases, :status, :additional_properties

      # @param problem_id [Commons::ProblemId]
      # @param default_test_cases [Array<Commons::TestCase>]
      # @param custom_test_cases [Array<Commons::TestCase>]
      # @param status [Submission::TestSubmissionStatus]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::TestSubmissionState]
      def initialze(problem_id:, default_test_cases:, custom_test_cases:, status:, additional_properties: nil)
        # @type [Commons::ProblemId]
        @problem_id = problem_id
        # @type [Array<Commons::TestCase>]
        @default_test_cases = default_test_cases
        # @type [Array<Commons::TestCase>]
        @custom_test_cases = custom_test_cases
        # @type [Submission::TestSubmissionStatus]
        @status = status
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of TestSubmissionState
      #
      # @param json_object [JSON]
      # @return [Submission::TestSubmissionState]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        problem_id = Commons::ProblemId.from_json(json_object: struct.problemId)
        default_test_cases = struct.defaultTestCases.map do |v|
          Commons::TestCase.from_json(json_object: v)
        end
        custom_test_cases = struct.customTestCases.map do |v|
          Commons::TestCase.from_json(json_object: v)
        end
        status = Submission::TestSubmissionStatus.from_json(json_object: struct.status)
        new(problem_id: problem_id, default_test_cases: default_test_cases, custom_test_cases: custom_test_cases,
            status: status, additional_properties: struct)
      end

      # Serialize an instance of TestSubmissionState to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          problemId: @problem_id,
          defaultTestCases: @default_test_cases,
          customTestCases: @custom_test_cases,
          status: @status
        }.to_json
      end
    end
  end
end
