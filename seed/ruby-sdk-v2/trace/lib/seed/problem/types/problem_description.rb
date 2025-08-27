# frozen_string_literal: true

module Seed
  module Problem
    module Types
      class ProblemDescription < Internal::Types::Model
        field :boards, lambda {
          Internal::Types::Array[Seed::Problem::Types::ProblemDescriptionBoard]
        }, optional: false, nullable: false
      end
    end
  end
end
