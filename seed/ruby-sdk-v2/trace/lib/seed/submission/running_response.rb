
module Seed
    module Types
        class RunningResponse < Internal::Types::Model
            field :submission_id, , optional: false, nullable: false
            field :state, , optional: false, nullable: false
        end
    end
end
