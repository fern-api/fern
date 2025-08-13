
module Seed
    module Types
        class GetDefaultStarterFilesResponse < Internal::Types::Model
            field :files, Internal::Types::Hash[Seed::commons::Language, Seed::problem::ProblemFiles], optional: false, nullable: false

    end
end
