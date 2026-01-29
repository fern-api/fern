# frozen_string_literal: true

module Seed
  module Types
    module Types
      class UnionWithSingleElement < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Types::Types::Foo }, key: "FOO"
      end
    end
  end
end
