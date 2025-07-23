# frozen_string_literal: true

module User
    module Types
        # A user object. This type is used throughout the following APIs:
        #   - createUser
        #   - getUser
        class User < Internal::Types::Model
            field :id, String, optional: true, nullable: true
            field :name, String, optional: true, nullable: true
            field :age, Array, optional: true, nullable: true
        end
    end
end
