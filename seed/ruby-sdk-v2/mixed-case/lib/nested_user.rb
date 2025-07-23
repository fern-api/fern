# frozen_string_literal: true

module Service
    module Types
        class NestedUser < Internal::Types::Model
            field :name, String, optional: true, nullable: true
            field :nested_user, User, optional: true, nullable: true
        end
    end
end
