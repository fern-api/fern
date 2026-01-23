# frozen_string_literal: true

module FernRequestParameters
  module Internal
    module Types
      module Unknown
        include FernRequestParameters::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
