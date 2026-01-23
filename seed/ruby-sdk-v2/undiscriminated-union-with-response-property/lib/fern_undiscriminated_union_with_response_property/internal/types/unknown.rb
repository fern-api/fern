# frozen_string_literal: true

module FernUndiscriminatedUnionWithResponseProperty
  module Internal
    module Types
      module Unknown
        include FernUndiscriminatedUnionWithResponseProperty::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
