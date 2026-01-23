# frozen_string_literal: true

module FernWebsocketInferredAuth
  module Internal
    module Types
      module Unknown
        include FernWebsocketInferredAuth::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
