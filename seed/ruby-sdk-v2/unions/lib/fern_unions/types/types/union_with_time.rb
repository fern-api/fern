# frozen_string_literal: true

module FernUnions
  module Types
    module Types
      class UnionWithTime < Internal::Types::Model
        extend FernUnions::Internal::Types::Union

        discriminant :type

        member -> { Integer }, key: "VALUE"
        member -> { String }, key: "DATE"
        member -> { String }, key: "DATETIME"
      end
    end
  end
end
