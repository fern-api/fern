# frozen_string_literal: true

module FernUnions
  module Types
    module Types
      class UnionWithDiscriminant < Internal::Types::Model
        extend FernUnions::Internal::Types::Union

        discriminant :type

        member -> { FernUnions::Types::Types::Foo }, key: "FOO"
        member -> { FernUnions::Types::Types::Bar }, key: "BAR"
      end
    end
  end
end
