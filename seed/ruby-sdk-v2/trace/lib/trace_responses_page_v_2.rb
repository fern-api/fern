# frozen_string_literal: true

module Submission
    module Types
        class TraceResponsesPageV2 < Internal::Types::Model
            field :offset, Array, optional: true, nullable: true
            field :trace_responses, Array, optional: true, nullable: true
        end
    end
end
