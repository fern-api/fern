# frozen_string_literal: true

module Seed
  module Types
    # Duplicate types.
    class UnionWithDuplicateTypes < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { String }
      member -> { Integer }
      member -> { Internal::Types::Array[String] }
    end
  end
end
