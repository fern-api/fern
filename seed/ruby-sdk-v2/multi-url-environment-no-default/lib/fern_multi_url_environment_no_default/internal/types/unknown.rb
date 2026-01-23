# frozen_string_literal: true

module FernMultiUrlEnvironmentNoDefault
  module Internal
    module Types
      module Unknown
        include FernMultiUrlEnvironmentNoDefault::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
