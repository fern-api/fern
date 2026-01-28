# frozen_string_literal: true

module Seed
  module Union
    module Types
      # Duplicate types.
      class UnionWithDuplicateTypes < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { String }
        member -> { Internal::Types::Array[String] }
        member -> { Integer }
        member -> { Internal::Types::Array[String] }
      end
    end
  end
end
