# frozen_string_literal: true

module FernPublicObject
  module Internal
    module Types
      module Unknown
        include FernPublicObject::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
