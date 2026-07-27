# frozen_string_literal: true

module Seed
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
          return value if values.include?(value)

          if value.is_a?(::String) || value.is_a?(::Symbol)
            candidate = value.to_s
            match = values.find do |member|
              (member.is_a?(::String) || member.is_a?(::Symbol)) && member.to_s.casecmp?(candidate)
            end
            return match unless match.nil?
          end

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
