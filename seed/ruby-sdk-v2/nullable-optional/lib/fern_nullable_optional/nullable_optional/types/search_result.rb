# frozen_string_literal: true

module FernNullableOptional
  module NullableOptional
    module Types
      # Undiscriminated union for testing
      class SearchResult < Internal::Types::Model
        extend FernNullableOptional::Internal::Types::Union

        discriminant :type

        member -> { FernNullableOptional::NullableOptional::Types::UserResponse }, key: "USER"
        member -> { FernNullableOptional::NullableOptional::Types::Organization }, key: "ORGANIZATION"
        member -> { FernNullableOptional::NullableOptional::Types::Document }, key: "DOCUMENT"
      end
    end
  end
end
