# frozen_string_literal: true

module Seed
  module Types
    module Types
      class UnionWithBaseProperties < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Integer }, key: "integer"
        member -> { String }, key: "string"
        member -> { Seed::Types::Types::Foo }, key: "foo"
      end
    end
  end
end
