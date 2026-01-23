# frozen_string_literal: true

module FernUnknown
  module Internal
    module Types
      module Unknown
        include FernUnknown::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
