# frozen_string_literal: true

module FernPagination
  module Complex
    module Types
      class SearchRequestQuery < Internal::Types::Model
        extend FernPagination::Internal::Types::Union

        member -> { FernPagination::Complex::Types::SingleFilterSearchRequest }
        member -> { FernPagination::Complex::Types::MultipleFilterSearchRequest }
      end
    end
  end
end
