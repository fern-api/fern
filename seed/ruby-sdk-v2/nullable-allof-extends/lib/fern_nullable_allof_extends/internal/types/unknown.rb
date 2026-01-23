# frozen_string_literal: true

module FernNullableAllofExtends
  module Internal
    module Types
      module Unknown
        include FernNullableAllofExtends::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
