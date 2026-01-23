# frozen_string_literal: true

module FernTrace
  module V2
    module Problem
      module Types
        class TestCaseImplementation < Internal::Types::Model
          field :description, -> { FernTrace::V2::Problem::Types::TestCaseImplementationDescription }, optional: false, nullable: false
          field :function, -> { FernTrace::V2::Problem::Types::TestCaseFunction }, optional: false, nullable: false
        end
      end
    end
  end
end
