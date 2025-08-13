
module Seed
    module Types
        class SearchRequest < Internal::Types::Model
            field :pagination, Seed::complex::StartingAfterPaging, optional: true, nullable: false
            field :query, Seed::complex::SearchRequestQuery, optional: false, nullable: false

    end
end
