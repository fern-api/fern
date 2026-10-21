# frozen_string_literal: true

require_relative "../.."

module Seed
  module Union
    module Types
      module AliasedLeafA
        # AliasedLeafA is an alias for LeafObjectA

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
