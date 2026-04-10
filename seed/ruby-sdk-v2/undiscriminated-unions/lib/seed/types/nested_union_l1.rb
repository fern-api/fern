# frozen_string_literal: true

module Seed
  module Types
    # Nested layer 1.
    class NestedUnionL1 < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Integer }
      member -> { Internal::Types::Array[String] }
      member -> { Seed::Types::NestedUnionL2 }
    end
  end
end
