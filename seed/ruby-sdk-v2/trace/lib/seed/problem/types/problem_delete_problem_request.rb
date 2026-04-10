# frozen_string_literal: true

module Seed
  module Problem
    module Types
      class ProblemDeleteProblemRequest < Internal::Types::Model
        field :problem_id, -> { String }, optional: false, nullable: false, api_name: "problemId"
      end
    end
  end
end
