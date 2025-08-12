
module Seed
    module Types
        class TracedTestCase < Internal::Types::Model
            field :result, , optional: false, nullable: false
            field :trace_responses_size, , optional: false, nullable: false
        end
    end
end
