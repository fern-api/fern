# frozen_string_literal: true

module FernWebsocket
  module Internal
    module Types
      module Unknown
        include FernWebsocket::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
