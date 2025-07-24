# frozen_string_literal: true

module Users
    module Types
        class UserPage < Internal::Types::Model
            field :data, UserListContainer, optional: true, nullable: true
            field :next_, Array, optional: true, nullable: true
        end
    end
end
