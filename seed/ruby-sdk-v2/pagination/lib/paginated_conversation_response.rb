# frozen_string_literal: true

module Complex
    module Types
        class PaginatedConversationResponse < Internal::Types::Model
            field :conversations, Array, optional: true, nullable: true
            field :pages, Array, optional: true, nullable: true
            field :total_count, Integer, optional: true, nullable: true
            field :type, Array, optional: true, nullable: true
        end
    end
end
