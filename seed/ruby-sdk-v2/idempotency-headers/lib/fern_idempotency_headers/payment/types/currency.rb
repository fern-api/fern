# frozen_string_literal: true

module FernIdempotencyHeaders
  module Payment
    module Types
      module Currency
        extend FernIdempotencyHeaders::Internal::Types::Enum

        USD = "USD"
        YEN = "YEN"
      end
    end
  end
end
