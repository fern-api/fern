# frozen_string_literal: true

module FernHeaderAuthEnvironmentVariable
  module Internal
    module Types
      module Unknown
        include FernHeaderAuthEnvironmentVariable::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
