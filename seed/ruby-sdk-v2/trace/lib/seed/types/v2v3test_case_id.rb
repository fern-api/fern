# frozen_string_literal: true

module Seed
  module Types
    module V2V3TestCaseID
      # V2V3TestCaseID is an alias for String

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
