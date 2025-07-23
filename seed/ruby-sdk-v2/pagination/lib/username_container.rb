# frozen_string_literal: true

module Users
    module Types
        class UsernameContainer < Internal::Types::Model
            field :results, Array, optional: true, nullable: true
        end
    end
end
