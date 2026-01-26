# frozen_string_literal: true

module FernStreaming
  module Internal
    module Types
      module Unknown
        include FernStreaming::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
