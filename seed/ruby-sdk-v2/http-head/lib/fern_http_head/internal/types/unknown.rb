# frozen_string_literal: true

module FernHttpHead
  module Internal
    module Types
      module Unknown
        include FernHttpHead::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
