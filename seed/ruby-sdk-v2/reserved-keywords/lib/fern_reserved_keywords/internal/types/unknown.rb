# frozen_string_literal: true

module FernReservedKeywords
  module Internal
    module Types
      module Unknown
        include FernReservedKeywords::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
