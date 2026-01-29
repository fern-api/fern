# frozen_string_literal: true

module Seed
  module Union
    module Types
      # Nested union root.
      class NestedUnionRoot < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { String }
        member -> { Internal::Types::Array[String] }
        member -> { Seed::Union::Types::NestedUnionL1 }
      end
    end
  end
end
