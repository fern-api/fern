# frozen_string_literal: true

module Seed
  module Types
    # Undiscriminated union with multiple object variants.
    # This reproduces the Pipedream issue where Emitter is a union of
    # DeployedComponent, HttpInterface, and TimerInterface.
    class MyUnion < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::VariantA }
      member -> { Seed::Types::VariantB }
      member -> { Seed::Types::VariantC }
    end
  end
end
