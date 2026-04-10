# frozen_string_literal: true

module Seed
  module Types
    class V2V3GetBasicSolutionFileResponse < Internal::Types::Model
      field :solution_file_by_language, -> { Internal::Types::Hash[String, Seed::Types::V2V3FileInfoV2] }, optional: false, nullable: false, api_name: "solutionFileByLanguage"
    end
  end
end
