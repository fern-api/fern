# frozen_string_literal: true

module FernLiteralsUnions
  module Literals
    module Types
      # An undiscriminated union over a literal.
      class UnionOverLiteral < Internal::Types::Model
        extend FernLiteralsUnions::Internal::Types::Union

        member -> { String }
        member -> { String }
      end
    end
  end
end
