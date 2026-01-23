# frozen_string_literal: true

module FernUnions
  module Types
    module Types
      class UnionWithBaseProperties < Internal::Types::Model
        extend FernUnions::Internal::Types::Union

        discriminant :type

        member -> { Integer }, key: "INTEGER"
        member -> { String }, key: "STRING"
        member -> { FernUnions::Types::Types::Foo }, key: "FOO"
      end
    end
  end
end
