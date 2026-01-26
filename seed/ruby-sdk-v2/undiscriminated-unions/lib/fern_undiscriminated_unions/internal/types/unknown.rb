# frozen_string_literal: true

module FernUndiscriminatedUnions
  module Internal
    module Types
      module Unknown
        include FernUndiscriminatedUnions::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
