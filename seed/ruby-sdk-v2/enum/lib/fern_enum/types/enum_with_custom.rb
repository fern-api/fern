# frozen_string_literal: true

module FernEnum
  module Types
    module EnumWithCustom
      extend FernEnum::Internal::Types::Enum

      SAFE = "safe"
      CUSTOM = "Custom"
    end
  end
end
