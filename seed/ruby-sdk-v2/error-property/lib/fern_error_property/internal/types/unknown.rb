# frozen_string_literal: true

module FernErrorProperty
  module Internal
    module Types
      module Unknown
        include FernErrorProperty::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
