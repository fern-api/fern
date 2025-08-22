# frozen_string_literal: true

module Seed
  module Types
    module ComplexType
      extend Seed::Internal::Types::Enum

      OBJECT = "object"
      UNION = "union"
      UNKNOWN = "unknown"end
  end
end
