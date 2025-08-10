# frozen_string_literal: true

module Submission
    module Types
        class InitializeProblemRequest < Internal::Types::Model
            field :problem_id, ProblemId, optional: true, nullable: true
            field :problem_version, Array, optional: true, nullable: true
        end
    end
end
