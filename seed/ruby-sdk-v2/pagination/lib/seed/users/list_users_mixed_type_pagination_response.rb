
module Seed
    module Types
        class ListUsersMixedTypePaginationResponse < Internal::Types::Model
            field :next_, String, optional: false, nullable: false
            field :data, Internal::Types::Array[Seed::users::User], optional: false, nullable: false

    end
end
