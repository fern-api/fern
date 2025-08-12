
module Seed
    module Types
        class GradedTestCaseUpdate < Internal::Types::Model
            field :test_case_id, , optional: false, nullable: false
            field :grade, , optional: false, nullable: false
        end
    end
end
