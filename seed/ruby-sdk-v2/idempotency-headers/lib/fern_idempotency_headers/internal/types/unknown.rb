# frozen_string_literal: true

module FernIdempotencyHeaders
  module Internal
    module Types
      module Unknown
        include FernIdempotencyHeaders::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
