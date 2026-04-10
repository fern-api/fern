# frozen_string_literal: true

module Seed
  module Types
    class ProblemFiles < Internal::Types::Model
      field :solution_file, -> { Seed::Types::FileInfo }, optional: false, nullable: false, api_name: "solutionFile"
      field :read_only_files, -> { Internal::Types::Array[Seed::Types::FileInfo] }, optional: false, nullable: false, api_name: "readOnlyFiles"
    end
  end
end
