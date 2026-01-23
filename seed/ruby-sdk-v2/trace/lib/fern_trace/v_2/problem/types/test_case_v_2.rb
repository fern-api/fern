# frozen_string_literal: true

module FernTrace
  module V2
    module Problem
      module Types
        class TestCaseV2 < Internal::Types::Model
          field :metadata, -> { FernTrace::V2::Problem::Types::TestCaseMetadata }, optional: false, nullable: false
          field :implementation, -> { FernTrace::V2::Problem::Types::TestCaseImplementationReference }, optional: false, nullable: false
          field :arguments, -> { Internal::Types::Hash[String, FernTrace::Commons::Types::VariableValue] }, optional: false, nullable: false
          field :expects, -> { FernTrace::V2::Problem::Types::TestCaseExpects }, optional: true, nullable: false
        end
      end
    end
  end
end
