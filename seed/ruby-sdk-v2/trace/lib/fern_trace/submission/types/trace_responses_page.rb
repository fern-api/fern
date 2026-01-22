# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class TraceResponsesPage < Internal::Types::Model
        field :offset, -> { Integer }, optional: true, nullable: false
        field :trace_responses, -> { Internal::Types::Array[FernTrace::Submission::Types::TraceResponse] }, optional: false, nullable: false, api_name: "traceResponses"
      end
    end
  end
end
