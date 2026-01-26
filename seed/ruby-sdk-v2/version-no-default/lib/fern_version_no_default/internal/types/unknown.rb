# frozen_string_literal: true

module FernVersionNoDefault
  module Internal
    module Types
      module Unknown
        include FernVersionNoDefault::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
