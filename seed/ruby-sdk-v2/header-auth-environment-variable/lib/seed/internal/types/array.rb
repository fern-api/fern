# frozen_string_literal: true

module Seed
  module Internal
    module Types
      # An array of a specific type
      class Array
        include Seed::Internal::Types::Type

        attr_reader :type

        class << self
          # Instantiates a new `Array` of a given type
          #
          # @param type [Object] The member type of this array
          #
          # @return [Seed::Internal::Types::Array]
          def [](type)
            new(type)
          end
        end

        # @api private
        def initialize(type)
          @type = type
        end

        # Coerces a value into this array
        #
        # @param value [Object]
        # @option strict [Boolean]
        # @return [::Array]
        def coerce(value, strict: strict?)
          unless value.is_a?(::Array)
            raise Errors::TypeError, "cannot coerce `#{value.class}` to Array<#{type}>" if strict

            return value
          end

          value.map do |element|
            Utils.coerce(type, element, strict: strict)
          end
        end
      end
    end
  end
end
