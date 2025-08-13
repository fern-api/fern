
module Seed
    module Types
        class GradedResponseV2 < Internal::Types::Model
            field :submission_id, String, optional: false, nullable: false
            field :test_cases, Internal::Types::Hash[String, Seed::submission::TestCaseGrade], optional: false, nullable: false
        end
    end
end
