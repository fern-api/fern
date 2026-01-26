# frozen_string_literal: true

module FernSimpleFhir
  module Internal
    module Types
      module Unknown
        include FernSimpleFhir::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
