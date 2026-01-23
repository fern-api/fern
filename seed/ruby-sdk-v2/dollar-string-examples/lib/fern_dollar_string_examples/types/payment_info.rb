# frozen_string_literal: true

module FernDollarStringExamples
  module Types
    class PaymentInfo < Internal::Types::Model
      field :amount, -> { String }, optional: false, nullable: false
      field :currency, -> { String }, optional: false, nullable: false
      field :description, -> { String }, optional: true, nullable: false
    end
  end
end
