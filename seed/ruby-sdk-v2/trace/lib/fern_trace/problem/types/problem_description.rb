# frozen_string_literal: true

module FernTrace
  module Problem
    module Types
      class ProblemDescription < Internal::Types::Model
        field :boards, -> { Internal::Types::Array[FernTrace::Problem::Types::ProblemDescriptionBoard] }, optional: false, nullable: false
      end
    end
  end
end
