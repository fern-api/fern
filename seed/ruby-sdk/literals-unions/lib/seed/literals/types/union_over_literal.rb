# frozen_string_literal: true

module Seed
  module Literals
    module Types
      # An undiscriminated union over a literal.
      class UnionOverLiteral < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { String }
        member -> { String }
      end
    end
  end
end
