# frozen_string_literal: true

module FernSimpleApi
  module Internal
    module Types
      module Unknown
        include FernSimpleApi::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
