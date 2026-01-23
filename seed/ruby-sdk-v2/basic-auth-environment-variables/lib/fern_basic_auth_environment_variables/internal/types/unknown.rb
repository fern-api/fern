# frozen_string_literal: true

module FernBasicAuthEnvironmentVariables
  module Internal
    module Types
      module Unknown
        include FernBasicAuthEnvironmentVariables::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
