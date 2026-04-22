# frozen_string_literal: true

module Seed
  module Union
    module Types
      # Nested layer 1.
      class NestedUnionL1 < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { Integer }
        member -> { Internal::Types::Array[String] }
        member -> { Internal::Types::Array[String] }
        member -> { Seed::Union::Types::NestedUnionL2 }
      end
    end
  end
end
