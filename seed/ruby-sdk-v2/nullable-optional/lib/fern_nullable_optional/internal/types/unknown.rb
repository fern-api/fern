# frozen_string_literal: true

module FernNullableOptional
  module Internal
    module Types
      module Unknown
        include FernNullableOptional::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
