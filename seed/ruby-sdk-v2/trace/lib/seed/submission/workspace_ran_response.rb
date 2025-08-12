
module Seed
    module Types
        class WorkspaceRanResponse < Internal::Types::Model
            field :submission_id, String, optional: false, nullable: false
            field :run_details, Seed::submission::WorkspaceRunDetails, optional: false, nullable: false
        end
    end
end
