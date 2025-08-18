# frozen_string_literal: true

module Seed
    module Types
        class WorkspaceSubmissionState < Internal::Types::Model
            field :status, Seed::Submission::WorkspaceSubmissionStatus, optional: false, nullable: false

    end
end
