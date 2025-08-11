# frozen_string_literal: true

module User
    module Types
        class NestedUser < Internal::Types::Model
            field :name, String, optional: true, nullable: true
            field :user, User, optional: true, nullable: true
        end
    end
end
