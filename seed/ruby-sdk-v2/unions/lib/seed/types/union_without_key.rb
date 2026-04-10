# frozen_string_literal: true

module Seed
  module Types
    class UnionWithoutKey < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::UnionWithoutKeyZero }
      member -> { Seed::Types::UnionWithoutKeyOne }
    end
  end
end
