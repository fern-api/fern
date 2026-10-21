# frozen_string_literal: true

require_relative "../.."

module Seed
  module Submission
    module Types
      class WorkspaceTracedUpdate < Internal::Types::Model
        field :trace_responses_size, -> { Integer }, optional: false, nullable: false, api_name: "traceResponsesSize"
      end
    end
  end
end
