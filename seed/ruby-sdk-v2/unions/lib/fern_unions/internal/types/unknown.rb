# frozen_string_literal: true

module FernUnions
  module Internal
    module Types
      module Unknown
        include FernUnions::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
