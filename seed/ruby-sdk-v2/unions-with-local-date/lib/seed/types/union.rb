# frozen_string_literal: true

module Seed
  module Types
    # This is a simple union.
    class Union < Internal::Types::Model
      extend Seed::Internal::Types::Union

      discriminant :type

      member -> { Seed::Types::UnionFoo }, key: "FOO"
      member -> { Seed::Types::UnionBar }, key: "BAR"
    end
  end
end
