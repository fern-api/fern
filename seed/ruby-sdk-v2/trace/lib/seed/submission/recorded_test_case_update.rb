
module Seed
    module Types
        class RecordedTestCaseUpdate < Internal::Types::Model
            field :test_case_id, String, optional: false, nullable: false
            field :trace_responses_size, Integer, optional: false, nullable: false

    end
end
