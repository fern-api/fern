# frozen_string_literal: true

module FernAliasExtends
  module Types
    module AliasType
      # AliasType is an alias for Parent

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
