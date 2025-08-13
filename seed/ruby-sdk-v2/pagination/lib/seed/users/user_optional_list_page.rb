
module Seed
    module Types
        class UserOptionalListPage < Internal::Types::Model
            field :data, Seed::users::UserOptionalListContainer, optional: false, nullable: false
            field :next_, String, optional: true, nullable: false

    end
end
