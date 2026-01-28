# frozen_string_literal: true

module Seed
  module Types
    module Types
      # This is a simple union.
      class Union < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Types::Types::Foo }, key: "FOO"
        member -> { Seed::Types::Types::Bar }, key: "BAR"
      end
    end
  end
end
