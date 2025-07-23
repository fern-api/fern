# frozen_string_literal: true

module Complex
    module Types
        class SearchRequest < Internal::Types::Model
            field :pagination, Array, optional: true, nullable: true
            field :query, SearchRequestQuery, optional: true, nullable: true
        end
    end
end
