# frozen_string_literal: true

module Seed
  module Types
    module Types
      class UnionWithSubTypes < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Types::Types::Foo }, key: "foo"
        member -> { Seed::Types::Types::FooExtended }, key: "fooExtended"
      end
    end
  end
end
