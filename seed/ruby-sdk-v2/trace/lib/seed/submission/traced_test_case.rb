
module Seed
    module Types
        class TracedTestCase < Internal::Types::Model
            field :result, Seed::submission::TestCaseResultWithStdout, optional: false, nullable: false
            field :trace_responses_size, Integer, optional: false, nullable: false

    end
end
