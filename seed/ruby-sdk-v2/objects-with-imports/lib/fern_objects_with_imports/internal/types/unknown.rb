# frozen_string_literal: true

module FernObjectsWithImports
  module Internal
    module Types
      module Unknown
        include FernObjectsWithImports::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
