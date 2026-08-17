# frozen_string_literal: true

module Seed
  module Types
    class RequiredRefundRequest < Internal::Types::Model
      field :id, -> { String }, optional: false, nullable: false

      field :body, -> { Seed::Types::RefundRequest }, optional: false, nullable: false
    end
  end
end
