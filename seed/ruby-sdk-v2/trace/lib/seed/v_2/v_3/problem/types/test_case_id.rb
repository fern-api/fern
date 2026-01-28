# frozen_string_literal: true

module Seed
  module V2
    module V3
      module Problem
        module Types
          module TestCaseId
            # TestCaseId is an alias for String

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
  end
end
