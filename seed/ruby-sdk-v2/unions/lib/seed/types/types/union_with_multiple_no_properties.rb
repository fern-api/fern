# frozen_string_literal: true

module Seed
  module Types
    module Types
      class UnionWithMultipleNoProperties < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Types::Types::Foo }, key: "foo"
        member -> { Object }, key: "empty1"
        member -> { Object }, key: "empty2"
      end
    end
  end
end
