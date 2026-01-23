# frozen_string_literal: true

module FernInferredAuthImplicit
  module Internal
    module Types
      module Unknown
        include FernInferredAuthImplicit::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
