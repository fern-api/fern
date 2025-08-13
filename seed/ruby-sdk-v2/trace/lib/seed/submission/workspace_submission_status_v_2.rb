
module Seed
    module Types
        class WorkspaceSubmissionStatusV2 < Internal::Types::Model
            field :updates, Internal::Types::Array[Seed::submission::WorkspaceSubmissionUpdate], optional: false, nullable: false
        end
    end
end
