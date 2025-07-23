# frozen_string_literal: true

module Users
    module Types
        class UserOptionalListContainer < Internal::Types::Model
            field :users, Array, optional: true, nullable: true
        end
    end
end
