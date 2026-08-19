# frozen_string_literal: true

module Seed
  module Types
    class OrderCompletedPayload < Internal::Types::Model
      field :order_id, -> { String }, optional: false, nullable: false, api_name: "orderId"

      field :total, -> { Integer }, optional: false, nullable: false

      field :currency, -> { String }, optional: false, nullable: false
    end
  end
end
