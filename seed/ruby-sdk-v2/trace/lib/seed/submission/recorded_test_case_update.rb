
module Seed
    module Types
        class RecordedTestCaseUpdate < Internal::Types::Model
            field :test_case_id, , optional: false, nullable: false
            field :trace_responses_size, , optional: false, nullable: false
        end
    end
end
