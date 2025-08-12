
module Seed
    module Types
        class UsernameCursor < Internal::Types::Model
            field :cursor, Seed::UsernamePage, optional: false, nullable: false
        end
    end
end
