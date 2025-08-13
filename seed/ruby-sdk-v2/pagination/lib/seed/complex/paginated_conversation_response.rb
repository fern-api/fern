
module Seed
    module Types
        class PaginatedConversationResponse < Internal::Types::Model
            field :conversations, Internal::Types::Array[Seed::complex::Conversation], optional: false, nullable: false
            field :pages, Seed::complex::CursorPages, optional: true, nullable: false
            field :total_count, Integer, optional: false, nullable: false
            field :type, String, optional: false, nullable: false
        end
    end
end
