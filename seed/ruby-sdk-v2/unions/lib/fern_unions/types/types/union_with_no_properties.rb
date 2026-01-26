# frozen_string_literal: true

module FernUnions
  module Types
    module Types
      class UnionWithNoProperties < Internal::Types::Model
        extend FernUnions::Internal::Types::Union

        discriminant :type

        member -> { FernUnions::Types::Types::Foo }, key: "FOO"
        member -> { Object }, key: "EMPTY"
      end
    end
  end
end
