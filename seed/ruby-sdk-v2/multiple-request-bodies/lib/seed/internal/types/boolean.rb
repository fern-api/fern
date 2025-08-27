# frozen_string_literal: true

module Seed
  module Internal
    module Types
      module Boolean
        extend Seed::Internal::Types::Union

        member TrueClass
        member FalseClass

        # Overrides the base coercion method for enums to allow integer and string values to become booleans
        #
        # @param value [Object]
        # @option strict [Boolean]
        # @return [Object]
        def self.coerce(value, strict: strict?)
          case value
          when TrueClass, FalseClass
            value
          when Integer
            return value == 1
          when String
            return %w[1 true].include?(value)
          end

          raise Errors::TypeError, "cannot coerce `#{value.class}` to Boolean" if strict

          value
        end
      end
    end
  end
end
