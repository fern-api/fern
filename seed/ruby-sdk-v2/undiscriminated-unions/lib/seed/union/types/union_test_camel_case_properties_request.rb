# frozen_string_literal: true

module Seed
  module Union
    module Types
      class UnionTestCamelCasePropertiesRequest < Internal::Types::Model
        field :payment_method, -> { Seed::Types::PaymentMethodUnion }, optional: false, nullable: false, api_name: "paymentMethod"
      end
    end
  end
end
