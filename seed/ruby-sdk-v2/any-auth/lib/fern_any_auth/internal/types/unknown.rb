# frozen_string_literal: true

module FernAnyAuth
  module Internal
    module Types
      module Unknown
        include FernAnyAuth::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
