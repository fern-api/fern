# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Union
    module Types
      class TokenizeCard < Internal::Types::Model
        field :method_, -> { String }, optional: false, nullable: false, api_name: "method"

        field :card_number, -> { String }, optional: false, nullable: false, api_name: "cardNumber"
      end
    end
  end
end
