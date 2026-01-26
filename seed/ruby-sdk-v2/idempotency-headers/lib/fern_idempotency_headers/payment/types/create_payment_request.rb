# frozen_string_literal: true

module FernIdempotencyHeaders
  module Payment
    module Types
      class CreatePaymentRequest < Internal::Types::Model
        field :amount, -> { Integer }, optional: false, nullable: false
        field :currency, -> { FernIdempotencyHeaders::Payment::Types::Currency }, optional: false, nullable: false
      end
    end
  end
end
