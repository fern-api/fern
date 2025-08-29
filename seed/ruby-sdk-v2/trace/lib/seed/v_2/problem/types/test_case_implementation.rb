# frozen_string_literal: true

module Seed
  module V2
    module Problem
      module Types
        class TestCaseImplementation < Internal::Types::Model
          field :description, lambda {
            Seed::V2::Problem::Types::TestCaseImplementationDescription
          }, optional: false, nullable: false
          field :function, -> { Seed::V2::Problem::Types::TestCaseFunction }, optional: false, nullable: false
        end
      end
    end
  end
end
