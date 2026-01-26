# frozen_string_literal: true

module FernNullableRequestBody
  module Internal
    module Types
      module Unknown
        include FernNullableRequestBody::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
