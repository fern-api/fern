# frozen_string_literal: true

module FernUnions
  module Types
    module Types
      class UnionWithSingleElement < Internal::Types::Model
        extend FernUnions::Internal::Types::Union

        discriminant :type

        member -> { FernUnions::Types::Types::Foo }, key: "FOO"
      end
    end
  end
end
