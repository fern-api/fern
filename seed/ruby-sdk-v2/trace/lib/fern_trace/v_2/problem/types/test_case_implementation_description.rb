# frozen_string_literal: true

module FernTrace
  module V2
    module Problem
      module Types
        class TestCaseImplementationDescription < Internal::Types::Model
          field :boards, -> { Internal::Types::Array[FernTrace::V2::Problem::Types::TestCaseImplementationDescriptionBoard] }, optional: false, nullable: false
        end
      end
    end
  end
end
