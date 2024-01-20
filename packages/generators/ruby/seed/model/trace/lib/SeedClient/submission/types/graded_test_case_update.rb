# frozen_string_literal: true

module SeedClient
  module Submission
    class GradedTestCaseUpdate
      attr_reader :test_case_id, :grade, :additional_properties
      # @param test_case_id [V2::Problem::TestCaseId] 
      # @param grade [Submission::TestCaseGrade] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::GradedTestCaseUpdate] 
      def initialze(test_case_id:, grade:, additional_properties: nil)
        # @type [V2::Problem::TestCaseId] 
        @test_case_id = test_case_id
        # @type [Submission::TestCaseGrade] 
        @grade = grade
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of GradedTestCaseUpdate
      #
      # @param json_object [JSON] 
      # @return [Submission::GradedTestCaseUpdate] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        test_case_id = V2::Problem::TestCaseId.from_json(json_object: struct.testCaseId)
        grade = Submission::TestCaseGrade.from_json(json_object: struct.grade)
        new(test_case_id: test_case_id, grade: grade, additional_properties: struct)
      end
      # Serialize an instance of GradedTestCaseUpdate to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 testCaseId: @test_case_id,
 grade: @grade
}.to_json()
      end
    end
  end
end