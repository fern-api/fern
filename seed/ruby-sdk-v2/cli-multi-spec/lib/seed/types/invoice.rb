# frozen_string_literal: true

module Seed
  module Types
    class Invoice < Internal::Types::Model
      field :id, -> { String }, optional: false, nullable: false

      field :amount_cents, -> { Integer }, optional: false, nullable: false, api_name: "amountCents"

      field :currency, -> { String }, optional: true, nullable: false
    end
  end
end
