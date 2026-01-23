# frozen_string_literal: true

module FernEnum
  module Unknown
    module Types
      module Status
        extend FernEnum::Internal::Types::Enum

        KNOWN = "Known"
        UNKNOWN = "Unknown"
      end
    end
  end
end
