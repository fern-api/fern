# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Payment
    module Types
      module Currency
        extend Seed::Internal::Types::Enum

        USD = "USD"
        YEN = "YEN"
      end
    end
  end
end
