# frozen_string_literal: true

module Users
    module Types
        class ListUsersExtendedResponse < Internal::Types::Model
            field :total_count, Integer, optional: true, nullable: true
        end
    end
end
