# frozen_string_literal: true

module Seed
    module Types
        class GradedTestCaseUpdate < Internal::Types::Model
            field :test_case_id, String, optional: false, nullable: false
            field :grade, Seed::Submission::TestCaseGrade, optional: false, nullable: false

    end
end
