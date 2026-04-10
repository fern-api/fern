# frozen_string_literal: true

module Seed
  module Payment
    module Types
      class PaymentDeleteRequest < Internal::Types::Model
        field :payment_id, -> { String }, optional: false, nullable: false, api_name: "paymentId"
      end
    end
  end
end
