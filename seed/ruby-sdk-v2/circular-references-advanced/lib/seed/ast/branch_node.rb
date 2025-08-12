
module Seed
    module Types
        class BranchNode < Internal::Types::Model
            field :children, , optional: false, nullable: false
        end
    end
end
