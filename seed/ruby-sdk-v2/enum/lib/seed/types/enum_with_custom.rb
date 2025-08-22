# frozen_string_literal: true

module Seed
  module Types
    module EnumWithCustom
      extend Seed::Internal::Types::Enum

      SAFE = "safe"
      CUSTOM = "Custom"end
  end
end
