# frozen_string_literal: true

module Submission
    module Types
        class WorkspaceSubmissionState < Internal::Types::Model
            field :status, WorkspaceSubmissionStatus, optional: true, nullable: true
        end
    end
end
