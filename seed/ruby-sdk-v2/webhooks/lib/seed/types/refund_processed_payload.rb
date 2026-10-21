# frozen_string_literal: true

require_relative ".."

module Seed
  module Types
    class RefundProcessedPayload < Internal::Types::Model
      field :refund_id, -> { String }, optional: false, nullable: false, api_name: "refundId"

      field :amount, -> { Float }, optional: false, nullable: false

      field :reason, -> { String }, optional: true, nullable: false
    end
  end
end
