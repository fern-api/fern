# frozen_string_literal: true

module FernExhaustive
  module Internal
    module Types
      module Unknown
        include FernExhaustive::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
