# frozen_string_literal: true

module Submission
    module Types
        class WorkspaceTracedUpdate < Internal::Types::Model
            field :trace_responses_size, Integer, optional: true, nullable: true
        end
    end
end
