
module Seed
    module Types
        class TestCaseResultWithStdout < Internal::Types::Model
            field :result, Seed::submission::TestCaseResult, optional: false, nullable: false
            field :stdout, String, optional: false, nullable: false

    end
end
