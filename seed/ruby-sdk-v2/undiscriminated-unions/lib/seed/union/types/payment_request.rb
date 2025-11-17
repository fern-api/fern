# frozen_string_literal: true

module Seed
  module Union
    module Types
      class PaymentRequest < Internal::Types::Model
        field :payment_method, lambda {
          Seed::Union::Types::PaymentMethodUnion
        }, optional: false, nullable: false, api_name: "paymentMethod"
      end
    end
  end
end
