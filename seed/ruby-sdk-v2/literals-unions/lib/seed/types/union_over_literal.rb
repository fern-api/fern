# frozen_string_literal: true

module Seed
  module Types
    # An undiscriminated union over a literal.
    class UnionOverLiteral < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { String }
      member -> { Seed::Types::LiteralString }
    end
  end
end
