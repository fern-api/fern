
module Seed
    module Types
        class NestedUser < Internal::Types::Model
            field :name, String, optional: false, nullable: false
            field :nested_user, Seed::service::User, optional: false, nullable: false

    end
end
