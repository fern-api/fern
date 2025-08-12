
module Seed
    module Types
        class TraceResponsesPageV2 < Internal::Types::Model
            field :offset, Integer, optional: true, nullable: false
            field :trace_responses, Internal::Types::Array[Seed::submission::TraceResponseV2], optional: false, nullable: false
        end
    end
end
