
module Seed
    module Types
        # A user object. This type is used throughout the following APIs:
        #   - createUser
        #   - getUser
        class User < Internal::Types::Model
            field :id, String, optional: false, nullable: false
            field :name, String, optional: false, nullable: false
            field :age, Integer, optional: true, nullable: false
        end
    end
end
