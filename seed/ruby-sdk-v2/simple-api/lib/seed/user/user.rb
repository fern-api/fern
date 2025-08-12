
module Seed
    module Types
        class User < Internal::Types::Model
            field :id, , optional: false, nullable: false
            field :name, , optional: false, nullable: false
            field :email, , optional: false, nullable: false
        end
    end
end
