# frozen_string_literal: true

module Seed
  module NullableOptional
    module Types
      # Undiscriminated union for testing
      class SearchResult < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::NullableOptional::Types::UserResponse }, key: "USER"
        member -> { Seed::NullableOptional::Types::Organization }, key: "ORGANIZATION"
        member -> { Seed::NullableOptional::Types::Document }, key: "DOCUMENT"
      end
    end
  end
end
