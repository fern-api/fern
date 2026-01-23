# frozen_string_literal: true

module FernUnionsWithLocalDate
  module Internal
    module Types
      module Unknown
        include FernUnionsWithLocalDate::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
