# frozen_string_literal: true

module Seed
  module Types
    # A node representing an LLM call. This is a oneOf of two object shapes
    # sharing the same discriminant value, to test that the importer merges
    # them into a single object rather than wrapping in a "value" property.
    class AstllmNode < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::AstllmNodeWithSchema }

      member -> { Seed::Types::AstllmNodeWithPrompt }
    end
  end
end
