# frozen_string_literal: true

module Seed
  module Types
    module Types
      class UnionWithDuplicateTypes < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Types::Types::Foo }, key: "FOO_1"
        member -> { Seed::Types::Types::Foo }, key: "FOO_2"
      end
    end
  end
end
