# frozen_string_literal: true

module FernUnionsWithLocalDate
  module Types
    module Types
      class UnionWithBaseProperties < Internal::Types::Model
        extend FernUnionsWithLocalDate::Internal::Types::Union

        discriminant :type

        member -> { Integer }, key: "INTEGER"
        member -> { String }, key: "STRING"
        member -> { FernUnionsWithLocalDate::Types::Types::Foo }, key: "FOO"
      end
    end
  end
end
