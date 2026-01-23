# frozen_string_literal: true

module FernVariables
  module Internal
    module Types
      module Unknown
        include FernVariables::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
