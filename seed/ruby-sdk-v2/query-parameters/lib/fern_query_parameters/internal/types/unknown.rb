# frozen_string_literal: true

module FernQueryParameters
  module Internal
    module Types
      module Unknown
        include FernQueryParameters::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
