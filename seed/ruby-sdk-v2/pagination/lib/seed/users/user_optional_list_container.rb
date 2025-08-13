
module Seed
    module Types
        class UserOptionalListContainer < Internal::Types::Model
            field :users, Internal::Types::Array[Seed::users::User], optional: true, nullable: false
        end
    end
end
