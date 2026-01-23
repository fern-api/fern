# frozen_string_literal: true

module FernApiWideBasePath
  module Internal
    module Types
      module Unknown
        include FernApiWideBasePath::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
