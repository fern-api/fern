# frozen_string_literal: true

module Seed
  module Types
    module Types
      # This is a simple union.
      class Union < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Types::Types::Foo }, key: "foo"
        member -> { Seed::Types::Types::Bar }, key: "bar"
      end
    end
  end
end
