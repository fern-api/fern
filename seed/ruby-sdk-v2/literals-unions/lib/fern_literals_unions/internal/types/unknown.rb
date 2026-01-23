# frozen_string_literal: true

module FernLiteralsUnions
  module Internal
    module Types
      module Unknown
        include FernLiteralsUnions::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
