# frozen_string_literal: true

module FernExtraProperties
  module Internal
    module Types
      module Unknown
        include FernExtraProperties::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
