# frozen_string_literal: true

module Seed
    module Types
        class GetDefaultStarterFilesResponse < Internal::Types::Model
            field :files, Internal::Types::Hash[Seed::Commons::Language, Seed::Problem::ProblemFiles], optional: false, nullable: false

    end
end
