
module Seed
    module Types
        class SearchRequest < Internal::Types::Model
            field :pagination, , optional: true, nullable: false
            field :query, , optional: false, nullable: false
        end
    end
end
