# frozen_string_literal: true

require_relative "v_2/problem/types/TEST_CASE_ID"
require_relative "submission/types/TestCaseGrade"
require "json"

module SeedClient
  module Submission
    class GradedTestCaseUpdate
      attr_reader :test_case_id, :grade, :additional_properties

      # @param test_case_id [V2::Problem::TEST_CASE_ID]
      # @param grade [Submission::TestCaseGrade]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::GradedTestCaseUpdate]
      def initialze(test_case_id:, grade:, additional_properties: nil)
        # @type [V2::Problem::TEST_CASE_ID]
        @test_case_id = test_case_id
        # @type [Submission::TestCaseGrade]
        @grade = grade
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of GradedTestCaseUpdate
      #
      # @param json_object [JSON]
      # @return [Submission::GradedTestCaseUpdate]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        test_case_id = struct.testCaseId
        grade = Submission::TestCaseGrade.from_json(json_object: struct.grade)
        new(test_case_id: test_case_id, grade: grade, additional_properties: struct)
      end

      # Serialize an instance of GradedTestCaseUpdate to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { testCaseId: @test_case_id, grade: @grade }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.test_case_id.is_a?(String) != false || raise("Passed value for field obj.test_case_id is not the expected type, validation failed.")
        Submission::TestCaseGrade.validate_raw(obj: obj.grade)
      end
    end
  end
end
