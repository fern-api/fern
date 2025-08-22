# frozen_string_literal: true

module Seed
  module V2
    module V3
      module Problem
        module Types
          class TestCaseImplementationDescription < Internal::Types::Model
            field :boards, lambda {
              Internal::Types::Array[Seed::V2::V3::Problem::Types::TestCaseImplementationDescriptionBoard]
            }, optional: false, nullable: false
          end
        end
      end
    end
  end
end
