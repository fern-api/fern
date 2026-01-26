# frozen_string_literal: true

module FernObject
  module Internal
    module Types
      module Unknown
        include FernObject::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
