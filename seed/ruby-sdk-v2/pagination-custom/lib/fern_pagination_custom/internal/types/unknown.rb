# frozen_string_literal: true

module FernPaginationCustom
  module Internal
    module Types
      module Unknown
        include FernPaginationCustom::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
