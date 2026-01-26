# frozen_string_literal: true

module FernUndiscriminatedUnions
  module Union
    module Types
      # Tests that nested properties with camelCase wire names are properly
      # converted from snake_case Ruby keys when passed as Hash values.
      class PaymentMethodUnion < Internal::Types::Model
        extend FernUndiscriminatedUnions::Internal::Types::Union

        member -> { FernUndiscriminatedUnions::Union::Types::TokenizeCard }
        member -> { FernUndiscriminatedUnions::Union::Types::ConvertToken }
      end
    end
  end
end
