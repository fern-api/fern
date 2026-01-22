# frozen_string_literal: true

module FernNoRetries
  module Internal
    module Types
      module Unknown
        include FernNoRetries::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
