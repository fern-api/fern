# frozen_string_literal: true

module FernCircularReferences
  module Internal
    module Types
      module Unknown
        include FernCircularReferences::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
