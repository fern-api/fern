# frozen_string_literal: true

module FernRequiredNullable
  module Internal
    module Types
      module Unknown
        include FernRequiredNullable::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
