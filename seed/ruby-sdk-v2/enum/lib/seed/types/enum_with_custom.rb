# frozen_string_literal: true

require_relative ".."

module Seed
  module Types
    module EnumWithCustom
      extend Seed::Internal::Types::Enum

      SAFE = "safe"
      CUSTOM = "Custom"
    end
  end
end
