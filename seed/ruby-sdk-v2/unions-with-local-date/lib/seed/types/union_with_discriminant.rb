# frozen_string_literal: true

module Seed
  module Types
    class UnionWithDiscriminant < Internal::Types::Model
      extend Seed::Internal::Types::Union

      discriminant :type

      member -> { Seed::Types::UnionWithDiscriminantFoo }, key: "FOO"
      member -> { Seed::Types::UnionWithDiscriminantBar }, key: "BAR"
    end
  end
end
