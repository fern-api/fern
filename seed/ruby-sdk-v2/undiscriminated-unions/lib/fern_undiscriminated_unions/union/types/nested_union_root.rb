# frozen_string_literal: true

module FernUndiscriminatedUnions
  module Union
    module Types
      # Nested union root.
      class NestedUnionRoot < Internal::Types::Model
        extend FernUndiscriminatedUnions::Internal::Types::Union

        member -> { String }
        member -> { Internal::Types::Array[String] }
        member -> { FernUndiscriminatedUnions::Union::Types::NestedUnionL1 }
      end
    end
  end
end
