# frozen_string_literal: true

module Api
    module Types
        class UsernameCursor < Internal::Types::Model
            field :cursor, UsernamePage, optional: true, nullable: true
        end
    end
end
