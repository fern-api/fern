# frozen_string_literal: true

module Seed
  module Union
    module Types
      # Mix of primitives where some resolve to the same Java type.
      class UnionWithIdenticalPrimitives < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { Integer }
        member -> { Integer }
        member -> { String }
      end
    end
  end
end
