# frozen_string_literal: true

module FernUnionsWithLocalDate
  module Types
    module Types
      class UnionWithLiteral < Internal::Types::Model
        extend FernUnionsWithLocalDate::Internal::Types::Union

        discriminant :type

        member -> { String }, key: "FERN"
      end
    end
  end
end
