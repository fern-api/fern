# frozen_string_literal: true

module FernNullableOptional
  module NullableOptional
    module Types
      module OptionalUserId
        # OptionalUserId is an alias for Object

        # @option str [String]
        #
        # @return [untyped]
        def self.load(str)
          ::JSON.parse(str)
        end

        # @option value [untyped]
        #
        # @return [String]
        def self.dump(value)
          ::JSON.generate(value)
        end
      end
    end
  end
end
