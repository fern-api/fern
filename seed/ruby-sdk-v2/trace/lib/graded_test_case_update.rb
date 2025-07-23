# frozen_string_literal: true

module Submission
    module Types
        class GradedTestCaseUpdate < Internal::Types::Model
            field :test_case_id, TestCaseId, optional: true, nullable: true
            field :grade, TestCaseGrade, optional: true, nullable: true
        end
    end
end
