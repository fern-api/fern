# frozen_string_literal: true

module Users
    module Types
        class WithCursor < Internal::Types::Model
            field :cursor, Array, optional: true, nullable: true
        end
    end
end
