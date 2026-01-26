# frozen_string_literal: true

module FernStreamingParameter
  module Internal
    module Types
      module Unknown
        include FernStreamingParameter::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
