# frozen_string_literal: true

module seed
  module Internal
    module Types
      module Unknown
        include seed::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end 