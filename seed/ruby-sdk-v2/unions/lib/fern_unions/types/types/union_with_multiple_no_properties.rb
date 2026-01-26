# frozen_string_literal: true

module FernUnions
  module Types
    module Types
      class UnionWithMultipleNoProperties < Internal::Types::Model
        extend FernUnions::Internal::Types::Union

        discriminant :type

        member -> { FernUnions::Types::Types::Foo }, key: "FOO"
        member -> { Object }, key: "EMPTY_1"
        member -> { Object }, key: "EMPTY_2"
      end
    end
  end
end
