# frozen_string_literal: true

module FernTrace
  module Problem
    module Types
      class ProblemFiles < Internal::Types::Model
        field :solution_file, -> { FernTrace::Commons::Types::FileInfo }, optional: false, nullable: false, api_name: "solutionFile"
        field :read_only_files, -> { Internal::Types::Array[FernTrace::Commons::Types::FileInfo] }, optional: false, nullable: false, api_name: "readOnlyFiles"
      end
    end
  end
end
