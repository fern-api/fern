
module Seed
    module Types
        class TraceResponsesPage < Internal::Types::Model
            field :offset, Integer, optional: true, nullable: false
            field :trace_responses, Internal::Types::Array[Seed::submission::TraceResponse], optional: false, nullable: false

    end
end
