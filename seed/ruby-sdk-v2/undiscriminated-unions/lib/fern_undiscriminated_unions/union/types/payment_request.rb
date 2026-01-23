# frozen_string_literal: true

module FernUndiscriminatedUnions
  module Union
    module Types
      class PaymentRequest < Internal::Types::Model
        field :payment_method, -> { FernUndiscriminatedUnions::Union::Types::PaymentMethodUnion }, optional: false, nullable: false, api_name: "paymentMethod"
      end
    end
  end
end
