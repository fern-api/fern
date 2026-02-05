# frozen_string_literal: true

module Seed
  module Types
    module Types
      class UnionWithSubTypes < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Types::Types::Foo }, key: "FOO"
        member -> { Seed::Types::Types::FooExtended }, key: "FOO_EXTENDED"
      end
    end
  end
end
