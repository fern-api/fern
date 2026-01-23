# frozen_string_literal: true

module FernNullable
  module Internal
    module Types
      module Unknown
        include FernNullable::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
