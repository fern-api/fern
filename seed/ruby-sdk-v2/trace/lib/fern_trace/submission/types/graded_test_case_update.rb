# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class GradedTestCaseUpdate < Internal::Types::Model
        field :test_case_id, -> { String }, optional: false, nullable: false, api_name: "testCaseId"
        field :grade, -> { FernTrace::Submission::Types::TestCaseGrade }, optional: false, nullable: false
      end
    end
  end
end
