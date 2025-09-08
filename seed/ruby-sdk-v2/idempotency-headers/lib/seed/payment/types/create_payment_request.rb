# frozen_string_literal: true

module Seed
  module Payment
    module Types
      class CreatePaymentRequest < Internal::Types::Model
        field :amount, -> { Integer }, optional: false, nullable: false
        field :currency, -> { Seed::Payment::Types::Currency }, optional: false, nullable: false
      end
    end
  end
end
