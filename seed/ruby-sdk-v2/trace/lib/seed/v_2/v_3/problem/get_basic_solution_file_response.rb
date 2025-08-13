# frozen_string_literal: true

module Seed
    module Types
        class GetBasicSolutionFileResponse < Internal::Types::Model
            field :solution_file_by_language, Internal::Types::Hash[Seed::Commons::Language, Seed::V2::V3::Problem::FileInfoV2], optional: false, nullable: false

    end
end
