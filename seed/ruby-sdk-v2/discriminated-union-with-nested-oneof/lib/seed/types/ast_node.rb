# frozen_string_literal: true

module Seed
  module Types
    class AstNode < Internal::Types::Model
      extend Seed::Internal::Types::Union

      discriminant :type

      member -> { Seed::Types::AstNodeLlm }, key: "LLM"

      member -> { Seed::Types::AstTextNode }, key: "TEXT"

      member -> { Seed::Types::AstNullNode }, key: "NULL_LITERAL"
    end
  end
end
