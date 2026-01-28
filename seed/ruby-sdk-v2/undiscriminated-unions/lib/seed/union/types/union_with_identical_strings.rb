# frozen_string_literal: true

module Seed
  module Union
    module Types
      # Multiple string types that all resolve to String in Java.
      # This tests the fix for duplicate method signatures.
      class UnionWithIdenticalStrings < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { String }
      end
    end
  end
end
