# frozen_string_literal: true

module Users
    module Types
        class UserOptionalListPage < Internal::Types::Model
            field :data, UserOptionalListContainer, optional: true, nullable: true
            field :next_, Array, optional: true, nullable: true
        end
    end
end
