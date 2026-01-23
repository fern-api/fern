# frozen_string_literal: true

module FernOptional
  module Internal
    module Types
      module Unknown
        include FernOptional::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
