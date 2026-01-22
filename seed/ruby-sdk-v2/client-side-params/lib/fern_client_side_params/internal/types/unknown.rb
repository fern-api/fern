# frozen_string_literal: true

module FernClientSideParams
  module Internal
    module Types
      module Unknown
        include FernClientSideParams::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
