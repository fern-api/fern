# frozen_string_literal: true

module FernSingleUrlEnvironmentNoDefault
  module Internal
    module Types
      module Unknown
        include FernSingleUrlEnvironmentNoDefault::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
