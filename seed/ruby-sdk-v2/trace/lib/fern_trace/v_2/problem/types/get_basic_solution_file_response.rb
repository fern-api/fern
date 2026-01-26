# frozen_string_literal: true

module FernTrace
  module V2
    module Problem
      module Types
        class GetBasicSolutionFileResponse < Internal::Types::Model
          field :solution_file_by_language, -> { Internal::Types::Hash[FernTrace::Commons::Types::Language, FernTrace::V2::Problem::Types::FileInfoV2] }, optional: false, nullable: false, api_name: "solutionFileByLanguage"
        end
      end
    end
  end
end
