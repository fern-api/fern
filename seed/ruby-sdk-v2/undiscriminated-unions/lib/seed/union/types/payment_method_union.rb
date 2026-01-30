# frozen_string_literal: true

module Seed
  module Union
    module Types
      # Tests that nested properties with camelCase wire names are properly
      # converted from snake_case Ruby keys when passed as Hash values.
      class PaymentMethodUnion < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { Seed::Union::Types::TokenizeCard }
        member -> { Seed::Union::Types::ConvertToken }
      end
    end
  end
end
