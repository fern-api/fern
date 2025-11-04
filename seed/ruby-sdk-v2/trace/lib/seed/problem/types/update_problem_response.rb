# frozen_string_literal: true

module Seed
  module Problem
    module Types
      class UpdateProblemResponse < Internal::Types::Model
        field :problem_version, -> { Integer }, optional: false, nullable: false, api_name: "problemVersion"
      end
    end
  end
end
