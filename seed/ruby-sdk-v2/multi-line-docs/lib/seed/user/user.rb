
module Seed
    module Types
        # A user object. This type is used throughout the following APIs:
        #   - createUser
        #   - getUser
        class User < Internal::Types::Model
            field :id, , optional: false, nullable: false
            field :name, , optional: false, nullable: false
            field :age, , optional: true, nullable: false
        end
    end
end
