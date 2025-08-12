
module Seed
    module Types
        class StartingAfterPaging < Internal::Types::Model
            field :per_page, , optional: false, nullable: false
            field :starting_after, , optional: true, nullable: false
        end
    end
end
