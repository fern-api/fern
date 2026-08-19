# frozen_string_literal: true

module Seed
  module Types
    class RefundRequest < Internal::Types::Model
      field :amount, -> { Integer }, optional: true, nullable: false
    end
  end
end
