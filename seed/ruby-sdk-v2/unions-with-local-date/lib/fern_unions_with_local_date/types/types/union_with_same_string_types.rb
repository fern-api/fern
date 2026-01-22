# frozen_string_literal: true

module FernUnionsWithLocalDate
  module Types
    module Types
      class UnionWithSameStringTypes < Internal::Types::Model
        extend FernUnionsWithLocalDate::Internal::Types::Union

        discriminant :type

        member -> { String }, key: "CUSTOM_FORMAT"
        member -> { String }, key: "REGULAR_STRING"
        member -> { String }, key: "PATTERN_STRING"
      end
    end
  end
end
