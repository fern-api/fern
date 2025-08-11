# frozen_string_literal: true

module Submission
    module Types
        class WorkspaceSubmissionUpdate < Internal::Types::Model
            field :update_time, DateTime, optional: true, nullable: true
            field :update_info, WorkspaceSubmissionUpdateInfo, optional: true, nullable: true
        end
    end
end
