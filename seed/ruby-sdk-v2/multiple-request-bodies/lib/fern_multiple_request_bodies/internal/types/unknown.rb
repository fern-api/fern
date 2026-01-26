# frozen_string_literal: true

module FernMultipleRequestBodies
  module Internal
    module Types
      module Unknown
        include FernMultipleRequestBodies::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
