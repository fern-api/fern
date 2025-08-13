
module Seed
    module Types
        class GradedTestCaseUpdate < Internal::Types::Model
            field :test_case_id, String, optional: false, nullable: false
            field :grade, Seed::submission::TestCaseGrade, optional: false, nullable: false

    end
end
