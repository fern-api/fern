# frozen_string_literal: true

module Seed
  module Types
    class SearchRequestQuery < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::SingleFilterSearchRequest }
      member -> { Seed::Types::MultipleFilterSearchRequest }
    end
  end
end
