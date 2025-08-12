
module Seed
    module Types
        class TraceResponsesPage < Internal::Types::Model
            field :offset, , optional: true, nullable: false
            field :trace_responses, , optional: false, nullable: false
        end
    end
end
