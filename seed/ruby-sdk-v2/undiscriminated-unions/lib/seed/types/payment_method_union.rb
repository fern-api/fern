# frozen_string_literal: true

module Seed
  module Types
    # Tests that nested properties with camelCase wire names are properly
    # converted from snake_case Ruby keys when passed as Hash values.
    class PaymentMethodUnion < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::TokenizeCard }
      member -> { Seed::Types::ConvertToken }
    end
  end
end
