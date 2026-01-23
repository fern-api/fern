# frozen_string_literal: true

module FernPathParameters
  module Internal
    module Types
      module Unknown
        include FernPathParameters::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
