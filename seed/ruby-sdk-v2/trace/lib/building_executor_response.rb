# frozen_string_literal: true

module Submission
    module Types
        class BuildingExecutorResponse < Internal::Types::Model
            field :submission_id, SubmissionId, optional: true, nullable: true
            field :status, ExecutionSessionStatus, optional: true, nullable: true
        end
    end
end
