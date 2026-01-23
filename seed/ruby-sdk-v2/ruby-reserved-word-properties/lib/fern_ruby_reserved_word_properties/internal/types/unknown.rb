# frozen_string_literal: true

module FernRubyReservedWordProperties
  module Internal
    module Types
      module Unknown
        include FernRubyReservedWordProperties::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
