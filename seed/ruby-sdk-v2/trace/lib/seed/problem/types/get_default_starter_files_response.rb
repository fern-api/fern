# frozen_string_literal: true

module Seed
  module Problem
    module Types
      class GetDefaultStarterFilesResponse < Internal::Types::Model
        field :files, -> {
          Internal::Types::Hash[Seed::Commons::Types::Language, Seed::Problem::Types::ProblemFiles]
        }, optional: false, nullable: false
      end
    end
  end
end
