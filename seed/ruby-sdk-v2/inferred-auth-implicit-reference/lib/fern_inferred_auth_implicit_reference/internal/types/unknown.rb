# frozen_string_literal: true

module FernInferredAuthImplicitReference
  module Internal
    module Types
      module Unknown
        include FernInferredAuthImplicitReference::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
