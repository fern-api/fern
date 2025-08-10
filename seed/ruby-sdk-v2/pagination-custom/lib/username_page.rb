# frozen_string_literal: true

module Api
    module Types
        class UsernamePage < Internal::Types::Model
            field :after, Array, optional: true, nullable: true
            field :data, Array, optional: true, nullable: true
        end
    end
end
