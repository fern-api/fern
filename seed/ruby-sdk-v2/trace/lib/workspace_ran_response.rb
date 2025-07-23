# frozen_string_literal: true

module Submission
    module Types
        class WorkspaceRanResponse < Internal::Types::Model
            field :submission_id, SubmissionId, optional: true, nullable: true
            field :run_details, WorkspaceRunDetails, optional: true, nullable: true
        end
    end
end
