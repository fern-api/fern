# frozen_string_literal: true

module FernCrossPackageTypeNames
  module Internal
    module Types
      module Unknown
        include FernCrossPackageTypeNames::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
