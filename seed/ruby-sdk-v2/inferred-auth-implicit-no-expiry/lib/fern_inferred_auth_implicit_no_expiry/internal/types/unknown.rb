# frozen_string_literal: true

module FernInferredAuthImplicitNoExpiry
  module Internal
    module Types
      module Unknown
        include FernInferredAuthImplicitNoExpiry::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
