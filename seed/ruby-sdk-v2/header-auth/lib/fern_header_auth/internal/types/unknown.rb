# frozen_string_literal: true

module FernHeaderAuth
  module Internal
    module Types
      module Unknown
        include FernHeaderAuth::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
