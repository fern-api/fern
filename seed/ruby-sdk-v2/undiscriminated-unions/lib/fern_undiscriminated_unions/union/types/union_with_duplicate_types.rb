# frozen_string_literal: true

module FernUndiscriminatedUnions
  module Union
    module Types
      # Duplicate types.
      class UnionWithDuplicateTypes < Internal::Types::Model
        extend FernUndiscriminatedUnions::Internal::Types::Union

        member -> { String }
        member -> { Internal::Types::Array[String] }
        member -> { Integer }
        member -> { Internal::Types::Array[String] }
      end
    end
  end
end
