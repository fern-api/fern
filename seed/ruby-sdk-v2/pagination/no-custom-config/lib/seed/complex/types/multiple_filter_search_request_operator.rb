# frozen_string_literal: true

require_relative "../.."

module Seed
  module Complex
    module Types
      module MultipleFilterSearchRequestOperator
        extend Seed::Internal::Types::Enum

        AND = "AND"
        OR = "OR"
      end
    end
  end
end
