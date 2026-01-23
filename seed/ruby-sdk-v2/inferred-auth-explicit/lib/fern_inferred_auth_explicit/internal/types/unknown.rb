# frozen_string_literal: true

module FernInferredAuthExplicit
  module Internal
    module Types
      module Unknown
        include FernInferredAuthExplicit::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
