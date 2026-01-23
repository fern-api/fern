# frozen_string_literal: true

module FernContentType
  module Internal
    module Types
      module Unknown
        include FernContentType::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
