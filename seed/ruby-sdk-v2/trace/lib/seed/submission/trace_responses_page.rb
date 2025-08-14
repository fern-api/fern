# frozen_string_literal: true

module Seed
    module Types
        class TraceResponsesPage < Internal::Types::Model
            field :offset, Integer, optional: true, nullable: false
            field :trace_responses, Internal::Types::Array[Seed::Submission::TraceResponse], optional: false, nullable: false

    end
end
