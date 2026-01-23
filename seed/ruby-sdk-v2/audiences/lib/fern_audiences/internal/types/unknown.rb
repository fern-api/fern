# frozen_string_literal: true

module FernAudiences
  module Internal
    module Types
      module Unknown
        include FernAudiences::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
