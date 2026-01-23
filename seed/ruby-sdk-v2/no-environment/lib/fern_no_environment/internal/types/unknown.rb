# frozen_string_literal: true

module FernNoEnvironment
  module Internal
    module Types
      module Unknown
        include FernNoEnvironment::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
