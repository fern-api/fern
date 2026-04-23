# frozen_string_literal: true

module Seed
  module Complex
    module Types
      class SearchRequestQuery < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { Seed::Complex::Types::SingleFilterSearchRequest }
        member -> { Seed::Complex::Types::MultipleFilterSearchRequest }
      end
    end
  end
end
