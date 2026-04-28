# frozen_string_literal: true

module Seed
  module Union
    module Types
      # Tests that base-properties on an undiscriminated union are correctly
      # represented in the IR and generated code.
      class UnionWithBaseProperties < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { Seed::Union::Types::NamedMetadata }
        member -> { Internal::Types::Hash[String, Object] }
      end
    end
  end
end
