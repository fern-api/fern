# frozen_string_literal: true

module FernAliasExtends
  module Internal
    module Types
      module Unknown
        include FernAliasExtends::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
