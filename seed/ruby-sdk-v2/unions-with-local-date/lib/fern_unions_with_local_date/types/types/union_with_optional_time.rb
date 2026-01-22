# frozen_string_literal: true

module FernUnionsWithLocalDate
  module Types
    module Types
      class UnionWithOptionalTime < Internal::Types::Model
        extend FernUnionsWithLocalDate::Internal::Types::Union

        discriminant :type

        member -> { String }, key: "DATE"
        member -> { String }, key: "DATETIME"
      end
    end
  end
end
