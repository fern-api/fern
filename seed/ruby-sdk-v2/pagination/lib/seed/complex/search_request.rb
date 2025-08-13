# frozen_string_literal: true

module Seed
    module Types
        class SearchRequest < Internal::Types::Model
            field :pagination, Seed::Complex::StartingAfterPaging, optional: true, nullable: false
            field :query, Seed::Complex::SearchRequestQuery, optional: false, nullable: false

    end
end
