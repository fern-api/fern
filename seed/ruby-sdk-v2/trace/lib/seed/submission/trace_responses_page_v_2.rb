
module Seed
    module Types
        class TraceResponsesPageV2 < Internal::Types::Model
            field :offset, , optional: true, nullable: false
            field :trace_responses, , optional: false, nullable: false
        end
    end
end
