# frozen_string_literal: true

module Seed
  module V2
    module V3
      module Problem
        module Types
          class TestCaseExpects < Internal::Types::Model
            field :expected_stdout, -> { String }, optional: true, nullable: false, api_name: "expectedStdout"
          end
        end
      end
    end
  end
end
