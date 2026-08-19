# frozen_string_literal: true

module Seed
  module Types
    module SmallInteger
      # SmallInteger is an alias for Integer

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
