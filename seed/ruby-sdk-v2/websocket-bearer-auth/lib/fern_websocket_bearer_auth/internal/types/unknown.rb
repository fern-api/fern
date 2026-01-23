# frozen_string_literal: true

module FernWebsocketBearerAuth
  module Internal
    module Types
      module Unknown
        include FernWebsocketBearerAuth::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
