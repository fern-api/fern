# frozen_string_literal: true

module FernUnions
  module Types
    module Types
      class UnionWithDuplicateTypes < Internal::Types::Model
        extend FernUnions::Internal::Types::Union

        discriminant :type

        member -> { FernUnions::Types::Types::Foo }, key: "FOO_1"
        member -> { FernUnions::Types::Types::Foo }, key: "FOO_2"
      end
    end
  end
end
