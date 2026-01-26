# frozen_string_literal: true

module FernLiteral
  module Internal
    module Types
      module Unknown
        include FernLiteral::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
