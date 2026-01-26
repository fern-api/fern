# frozen_string_literal: true

module FernEndpointSecurityAuth
  module Internal
    module Types
      module Unknown
        include FernEndpointSecurityAuth::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
