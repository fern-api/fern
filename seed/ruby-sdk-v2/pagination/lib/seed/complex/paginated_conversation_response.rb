
module Seed
    module Types
        class PaginatedConversationResponse < Internal::Types::Model
            field :conversations, , optional: false, nullable: false
            field :pages, , optional: true, nullable: false
            field :total_count, , optional: false, nullable: false
            field :type, , optional: false, nullable: false
        end
    end
end
