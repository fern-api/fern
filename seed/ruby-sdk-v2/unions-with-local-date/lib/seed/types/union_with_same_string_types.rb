# frozen_string_literal: true

module Seed
  module Types
    class UnionWithSameStringTypes < Internal::Types::Model
      extend Seed::Internal::Types::Union

      discriminant :type

      member -> { Seed::Types::UnionWithSameStringTypesCustomFormat }, key: "CUSTOM_FORMAT"
      member -> { Seed::Types::UnionWithSameStringTypesRegularString }, key: "REGULAR_STRING"
      member -> { Seed::Types::UnionWithSameStringTypesPatternString }, key: "PATTERN_STRING"
    end
  end
end
