
module Seed
    module Types
        class GetExecutionSessionStateResponse < Internal::Types::Model
            field :states, , optional: false, nullable: false
            field :num_warming_instances, , optional: true, nullable: false
            field :warming_session_ids, , optional: false, nullable: false
        end
    end
end
