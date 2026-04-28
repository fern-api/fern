# frozen_string_literal: true

module Seed
  module Union
    module Types
      # Undiscriminated union whose members are named aliases of object types
      # (including an alias-of-alias). Required keys are disjoint, so a correct
      # deserializer must emit containsKey() guards for each alias variant.
      class AliasedObjectUnion < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { Seed::Union::Types::LeafObjectA }
        member -> { Seed::Union::Types::LeafObjectB }
      end
    end
  end
end
