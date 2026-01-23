# frozen_string_literal: true

module FernBearerTokenEnvironmentVariable
  module Internal
    module Types
      module Unknown
        include FernBearerTokenEnvironmentVariable::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
