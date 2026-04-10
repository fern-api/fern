# frozen_string_literal: true

module Seed
  module Types
    class TraceResponsesPage < Internal::Types::Model
      field :offset, -> { Integer }, optional: true, nullable: false
      field :trace_responses, -> { Internal::Types::Array[Seed::Types::TraceResponse] }, optional: false, nullable: false, api_name: "traceResponses"
    end
  end
end
