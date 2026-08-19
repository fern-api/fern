# frozen_string_literal: true

module Seed
  module Internal
    module Types
      # @abstract
      module Type
        include Seed::Internal::JSON::Serializable

        # Coerces a value to this type
        #
        # @param value [unknown]
        # @option strict [Boolean] If we should strictly coerce this value
        def coerce(value, strict: strict?)
          raise NotImplementedError
        end

        # Returns if strictness is on for this type, defaults to `false`
        #
        # @return [Boolean]
        def strict?
          @strict ||= false
        end

        # Enable strictness by default for this type
        #
        # @return [void]
        def strict!
          @strict = true
          self
        end
      end
    end
  end
end
