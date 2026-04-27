# frozen_string_literal: true

module Seed
  module Union
    module Types
      # Inner union with two object variants that have disjoint required keys.
      # Tests that required-key guards work correctly inside nested union contexts.
      class NestedObjectUnion < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { Seed::Union::Types::LeafTypeA }
        member -> { Seed::Union::Types::LeafTypeB }
      end
    end
  end
end
