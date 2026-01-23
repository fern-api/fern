# frozen_string_literal: true

module FernUnions
  module Types
    module Types
      class UnionWithLiteral < Internal::Types::Model
        extend FernUnions::Internal::Types::Union

        discriminant :type

        member -> { String }, key: "FERN"
      end
    end
  end
end
