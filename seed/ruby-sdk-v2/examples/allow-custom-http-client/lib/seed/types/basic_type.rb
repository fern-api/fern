# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    module BasicType
      extend Seed::Internal::Types::Enum

      PRIMITIVE = "primitive"
      LITERAL = "literal"
    end
  end
end
