# frozen_string_literal: true

module Seed
  module Union
    module Types
      # Union with multiple named type aliases that all resolve to the same C# type (string).
      # Without the fix, this would generate duplicate implicit operators:
      #   public static implicit operator UnionWithTypeAliases(string value) => ...
      #   public static implicit operator UnionWithTypeAliases(string value) => ...
      #   public static implicit operator UnionWithTypeAliases(string value) => ...
      # causing CS0557 compiler error.
      class UnionWithTypeAliases < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { String }
        member -> { String }
        member -> { String }
      end
    end
  end
end
