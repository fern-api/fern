# frozen_string_literal: true

module Users
    module Types
        class ListUsersMixedTypePaginationResponse < Internal::Types::Model
            field :next_, String, optional: true, nullable: true
            field :data, Array, optional: true, nullable: true
        end
    end
end
