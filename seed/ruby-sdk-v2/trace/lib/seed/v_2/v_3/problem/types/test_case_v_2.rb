# frozen_string_literal: true

module Seed
  module V2
    module V3
      module Problem
        module Types
          class TestCaseV2 < Internal::Types::Model
            field :metadata, -> { Seed::V2::V3::Problem::Types::TestCaseMetadata }, optional: false, nullable: false
            field :implementation, lambda {
              Seed::V2::V3::Problem::Types::TestCaseImplementationReference
            }, optional: false, nullable: false
            field :arguments, lambda {
              Internal::Types::Hash[String, Seed::Commons::Types::VariableValue]
            }, optional: false, nullable: false
            field :expects, -> { Seed::V2::V3::Problem::Types::TestCaseExpects }, optional: true, nullable: false
          end
        end
      end
    end
  end
end
