# frozen_string_literal: true

module FernUnionsWithLocalDate
  module Types
    module Types
      class UnionWithMultipleNoProperties < Internal::Types::Model
        extend FernUnionsWithLocalDate::Internal::Types::Union

        discriminant :type

        member -> { FernUnionsWithLocalDate::Types::Types::Foo }, key: "FOO"
        member -> { Object }, key: "EMPTY_1"
        member -> { Object }, key: "EMPTY_2"
      end
    end
  end
end
