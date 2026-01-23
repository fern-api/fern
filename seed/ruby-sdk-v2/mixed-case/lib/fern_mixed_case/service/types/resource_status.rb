# frozen_string_literal: true

module FernMixedCase
  module Service
    module Types
      module ResourceStatus
        extend FernMixedCase::Internal::Types::Enum

        ACTIVE = "ACTIVE"
        INACTIVE = "INACTIVE"
      end
    end
  end
end
