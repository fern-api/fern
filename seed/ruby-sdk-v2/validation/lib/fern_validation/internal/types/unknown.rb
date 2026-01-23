# frozen_string_literal: true

module FernValidation
  module Internal
    module Types
      module Unknown
        include FernValidation::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
