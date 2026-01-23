# frozen_string_literal: true

module FernEmptyClients
  module Internal
    module Types
      module Unknown
        include FernEmptyClients::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
