# frozen_string_literal: true

module Seed
  module Types
    module Types
      class UnionWithNoProperties < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Types::Types::Foo }, key: "FOO"
        member -> { Object }, key: "EMPTY"
      end
    end
  end
end
