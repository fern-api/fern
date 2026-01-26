# frozen_string_literal: true

module FernPropertyAccess
  module Internal
    module Types
      module Unknown
        include FernPropertyAccess::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
