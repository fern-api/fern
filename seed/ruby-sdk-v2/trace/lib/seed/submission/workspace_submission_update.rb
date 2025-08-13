
module Seed
    module Types
        class WorkspaceSubmissionUpdate < Internal::Types::Model
            field :update_time, String, optional: false, nullable: false
            field :update_info, Seed::submission::WorkspaceSubmissionUpdateInfo, optional: false, nullable: false
        end
    end
end
