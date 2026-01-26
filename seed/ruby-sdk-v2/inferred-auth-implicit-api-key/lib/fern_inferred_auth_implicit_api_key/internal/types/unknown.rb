# frozen_string_literal: true

module FernInferredAuthImplicitApiKey
  module Internal
    module Types
      module Unknown
        include FernInferredAuthImplicitApiKey::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
