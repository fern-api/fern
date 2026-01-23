# frozen_string_literal: true

module FernQueryParametersOpenapi
  module Internal
    module Types
      module Unknown
        include FernQueryParametersOpenapi::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
