# frozen_string_literal: true

module FernMultiUrlEnvironment
  module Internal
    module Types
      module Unknown
        include FernMultiUrlEnvironment::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
