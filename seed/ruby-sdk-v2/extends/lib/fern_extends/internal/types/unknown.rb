# frozen_string_literal: true

module FernExtends
  module Internal
    module Types
      module Unknown
        include FernExtends::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
