# frozen_string_literal: true

module Seed
  module Types
    module SingleFilterSearchRequestOperator
      extend Seed::Internal::Types::Enum
      EQUAL_TO = "="
      NOT_EQUALS = "!="
      IN = "IN"
      NIN = "NIN"
      LESS_THAN = "<"
      GREATER_THAN = ">"
       = "~"end
  end
end
