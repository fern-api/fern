# frozen_string_literal: true

module Seed
  module V2Problem
    module Types
      class V2ProblemGetLatestProblemRequest < Internal::Types::Model
        field :problem_id, -> { String }, optional: false, nullable: false, api_name: "problemId"
      end
    end
  end
end
