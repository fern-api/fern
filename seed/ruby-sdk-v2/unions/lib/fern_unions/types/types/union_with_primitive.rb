# frozen_string_literal: true

module FernUnions
  module Types
    module Types
      class UnionWithPrimitive < Internal::Types::Model
        extend FernUnions::Internal::Types::Union

        discriminant :type

        member -> { Integer }, key: "INTEGER"
        member -> { String }, key: "STRING"
      end
    end
  end
end
