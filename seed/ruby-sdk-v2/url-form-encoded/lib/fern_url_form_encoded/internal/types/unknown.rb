# frozen_string_literal: true

module FernUrlFormEncoded
  module Internal
    module Types
      module Unknown
        include FernUrlFormEncoded::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
