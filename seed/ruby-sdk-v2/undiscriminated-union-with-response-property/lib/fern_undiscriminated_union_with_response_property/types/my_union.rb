# frozen_string_literal: true

module FernUndiscriminatedUnionWithResponseProperty
  module Types
    # Undiscriminated union with multiple object variants.
    # This reproduces the Pipedream issue where Emitter is a union of
    # DeployedComponent, HttpInterface, and TimerInterface.
    class MyUnion < Internal::Types::Model
      extend FernUndiscriminatedUnionWithResponseProperty::Internal::Types::Union

      member -> { FernUndiscriminatedUnionWithResponseProperty::Types::VariantA }
      member -> { FernUndiscriminatedUnionWithResponseProperty::Types::VariantB }
      member -> { FernUndiscriminatedUnionWithResponseProperty::Types::VariantC }
    end
  end
end
