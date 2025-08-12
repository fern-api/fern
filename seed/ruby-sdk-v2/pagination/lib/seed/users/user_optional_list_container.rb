
module Seed
    module Types
        class UserOptionalListContainer < Internal::Types::Model
            field :users, , optional: true, nullable: false
        end
    end
end
