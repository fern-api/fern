
module Seed
    module Types
        class NextPage < Internal::Types::Model
            field :page, , optional: false, nullable: false
            field :starting_after, , optional: false, nullable: false
        end
    end
end
