# frozen_string_literal: true

module Seed
  module Types
    # Undiscriminated union with multiple object variants.
    # This reproduces the Pipedream issue where Emitter is a union of
    # DeployedComponent, HttpInterface, and TimerInterface.
    class MyUnion < Internal::Types::Model
      extend Seed::Internal::Types::Union

      discriminant :type

      member -> { Seed::Types::VariantA }, key: "A"
      member -> { Seed::Types::VariantB }, key: "B"
      member -> { Seed::Types::VariantC }, key: "C"
    end
  end
end
