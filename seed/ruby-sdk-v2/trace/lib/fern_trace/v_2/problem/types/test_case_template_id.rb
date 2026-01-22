# frozen_string_literal: true

module FernTrace
  module V2
    module Problem
      module Types
        module TestCaseTemplateId
          # TestCaseTemplateId is an alias for String

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
