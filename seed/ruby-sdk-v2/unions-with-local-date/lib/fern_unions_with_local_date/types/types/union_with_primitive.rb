# frozen_string_literal: true

module FernUnionsWithLocalDate
  module Types
    module Types
      class UnionWithPrimitive < Internal::Types::Model
        extend FernUnionsWithLocalDate::Internal::Types::Union

        discriminant :type

        member -> { Integer }, key: "INTEGER"
        member -> { String }, key: "STRING"
      end
    end
  end
end
