
module Seed
    module Types
        class TestSubmissionState < Internal::Types::Model
            field :problem_id, , optional: false, nullable: false
            field :default_test_cases, , optional: false, nullable: false
            field :custom_test_cases, , optional: false, nullable: false
            field :status, , optional: false, nullable: false
        end
    end
end
