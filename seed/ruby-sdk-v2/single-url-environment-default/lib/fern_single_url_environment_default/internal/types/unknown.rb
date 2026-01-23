# frozen_string_literal: true

module FernSingleUrlEnvironmentDefault
  module Internal
    module Types
      module Unknown
        include FernSingleUrlEnvironmentDefault::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
