
module Seed
    module Types
        class GradedResponse < Internal::Types::Model
            field :submission_id, String, optional: false, nullable: false
            field :test_cases, Internal::Types::Hash[String, Seed::submission::TestCaseResultWithStdout], optional: false, nullable: false
        end
    end
end
