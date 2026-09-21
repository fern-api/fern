# frozen_string_literal: true

module Seed
  module Types
    module BreakStrength
      extend Seed::Internal::Types::Enum

      NONE = "none"
      X_WEAK = "x-weak"
      WEAK = "weak"
      MEDIUM = "medium"
      STRONG = "strong"
      X_STRONG = "x-strong"
    end
  end
end
