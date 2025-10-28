# frozen_string_literal: true

module Seed
  module Internal
    module Types
      module Unknown
        include Seed::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
