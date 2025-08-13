
module Seed
    module Types
        class WorkspaceSubmissionState < Internal::Types::Model
            field :status, Seed::submission::WorkspaceSubmissionStatus, optional: false, nullable: false

    end
end
