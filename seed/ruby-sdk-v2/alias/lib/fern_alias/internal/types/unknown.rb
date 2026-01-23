# frozen_string_literal: true

module FernAlias
  module Internal
    module Types
      module Unknown
        include FernAlias::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
