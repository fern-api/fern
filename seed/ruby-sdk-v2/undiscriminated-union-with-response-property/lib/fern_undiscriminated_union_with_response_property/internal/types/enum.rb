# frozen_string_literal: true

module FernUndiscriminatedUnionWithResponseProperty
  module Internal
    module Types
      # Module for defining enums
      module Enum
        include Type

        # @api private
        #
        # @return [Array<Object>]
        def values
          @values ||= constants.map { |c| const_get(c) }
        end

        # @api private
        def finalize!
          values
        end

        # @api private
        def strict?
          @strict ||= false
        end

        # @api private
        def strict!
          @strict = true
        end

        def coerce(value, strict: strict?)
          coerced_value = Utils.coerce(Symbol, value)

          return coerced_value if values.include?(coerced_value)

          raise Errors::TypeError, "`#{value}` not in enum #{self}" if strict

          value
        end

        # Parse JSON string and coerce to the enum value
        #
        # @param str [String] JSON string to parse
        # @return [String] The enum value
        def load(str)
          coerce(::JSON.parse(str))
        end

        def inspect
          "#{name}[#{values.join(", ")}]"
        end
      end
    end
  end
end
