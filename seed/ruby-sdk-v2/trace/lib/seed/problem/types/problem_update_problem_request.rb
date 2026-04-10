# frozen_string_literal: true

module Seed
  module Problem
    module Types
      class ProblemUpdateProblemRequest < Internal::Types::Model
        field :problem_id, -> { String }, optional: false, nullable: false, api_name: "problemId"
        field :body, -> { Seed::Types::CreateProblemRequest }, optional: false, nullable: false
      end
    end
  end
end
