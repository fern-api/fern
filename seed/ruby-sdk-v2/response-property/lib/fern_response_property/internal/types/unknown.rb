# frozen_string_literal: true

module FernResponseProperty
  module Internal
    module Types
      module Unknown
        include FernResponseProperty::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
