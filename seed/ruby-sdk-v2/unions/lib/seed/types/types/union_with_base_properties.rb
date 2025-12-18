# frozen_string_literal: true

module Seed
  module Types
    module Types
      class UnionWithBaseProperties < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Integer }, key: "INTEGER"
        member -> { String }, key: "STRING"
        member -> { Seed::Types::Types::Foo }, key: "FOO"
      end
    end
  end
end
