# frozen_string_literal: true

module Seed
  module Types
    module Types
      class UnionWithMultipleNoProperties < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Types::Types::Foo }, key: "FOO"
        member -> { Object }, key: "EMPTY_1"
        member -> { Object }, key: "EMPTY_2"
      end
    end
  end
end
