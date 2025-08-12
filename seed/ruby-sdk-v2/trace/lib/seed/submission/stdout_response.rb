
module Seed
    module Types
        class StdoutResponse < Internal::Types::Model
            field :submission_id, , optional: false, nullable: false
            field :stdout, , optional: false, nullable: false
        end
    end
end
