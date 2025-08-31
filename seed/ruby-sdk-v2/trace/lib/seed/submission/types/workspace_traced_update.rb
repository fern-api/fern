# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class WorkspaceTracedUpdate < Internal::Types::Model
        field :trace_responses_size, -> { Integer }, optional: false, nullable: false
      end
    end
  end
end
