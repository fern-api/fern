# frozen_string_literal: true

module Seed
  module Types
    # Undiscriminated union for testing
    class SearchResult < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::SearchResultZero }
      member -> { Seed::Types::SearchResultOne }
      member -> { Seed::Types::SearchResultTwo }
    end
  end
end
