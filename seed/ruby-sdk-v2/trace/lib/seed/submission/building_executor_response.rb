
module Seed
    module Types
        class BuildingExecutorResponse < Internal::Types::Model
            field :submission_id, String, optional: false, nullable: false
            field :status, Seed::submission::ExecutionSessionStatus, optional: false, nullable: false

    end
end
