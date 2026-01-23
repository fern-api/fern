# frozen_string_literal: true

module FernUndiscriminatedUnions
  module Union
    module Types
      # Nested layer 1.
      class NestedUnionL1 < Internal::Types::Model
        extend FernUndiscriminatedUnions::Internal::Types::Union

        member -> { Integer }
        member -> { Internal::Types::Array[String] }
        member -> { Internal::Types::Array[String] }
        member -> { FernUndiscriminatedUnions::Union::Types::NestedUnionL2 }
      end
    end
  end
end
