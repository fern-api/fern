# frozen_string_literal: true

module FernPagination
  module Complex
    module Types
      class SearchRequest < Internal::Types::Model
        field :pagination, -> { FernPagination::Complex::Types::StartingAfterPaging }, optional: true, nullable: false
        field :query, -> { FernPagination::Complex::Types::SearchRequestQuery }, optional: false, nullable: false
      end
    end
  end
end
