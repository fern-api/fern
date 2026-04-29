# frozen_string_literal: true

module Seed
  module Types
    class PaymentNotificationPayload < Internal::Types::Model
      field :payment_id, -> { String }, optional: false, nullable: false, api_name: "paymentId"

      field :amount, -> { Integer }, optional: false, nullable: false

      field :status, -> { String }, optional: false, nullable: false
    end
  end
end
