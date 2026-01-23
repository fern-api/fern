# frozen_string_literal: true

module FernPagination
  module Internal
    module Types
      module Unknown
        include FernPagination::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
