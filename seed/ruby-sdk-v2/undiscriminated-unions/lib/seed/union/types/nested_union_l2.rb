# frozen_string_literal: true

module Seed
  module Union
    module Types
      # Nested layer 2.
      class NestedUnionL2 < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { Internal::Types::Boolean }
        member -> { Internal::Types::Array[String] }
        member -> { Internal::Types::Array[String] }
      end
    end
  end
end
