# frozen_string_literal: true

module Seed
  module Problem
    module Types
      class ProblemFiles < Internal::Types::Model
        field :solution_file, lambda {
          Seed::Commons::Types::FileInfo
        }, optional: false, nullable: false, api_name: "solutionFile"
        field :read_only_files, lambda {
          Internal::Types::Array[Seed::Commons::Types::FileInfo]
        }, optional: false, nullable: false, api_name: "readOnlyFiles"
      end
    end
  end
end
