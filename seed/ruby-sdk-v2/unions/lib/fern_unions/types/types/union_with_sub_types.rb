# frozen_string_literal: true

module FernUnions
  module Types
    module Types
      class UnionWithSubTypes < Internal::Types::Model
        extend FernUnions::Internal::Types::Union

        discriminant :type

        member -> { FernUnions::Types::Types::Foo }, key: "FOO"
        member -> { FernUnions::Types::Types::FooExtended }, key: "FOO_EXTENDED"
      end
    end
  end
end
