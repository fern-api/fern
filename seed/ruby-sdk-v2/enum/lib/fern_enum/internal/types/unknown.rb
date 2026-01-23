# frozen_string_literal: true

module FernEnum
  module Internal
    module Types
      module Unknown
        include FernEnum::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
