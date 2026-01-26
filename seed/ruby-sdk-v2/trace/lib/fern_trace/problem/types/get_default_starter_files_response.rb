# frozen_string_literal: true

module FernTrace
  module Problem
    module Types
      class GetDefaultStarterFilesResponse < Internal::Types::Model
        field :files, -> { Internal::Types::Hash[FernTrace::Commons::Types::Language, FernTrace::Problem::Types::ProblemFiles] }, optional: false, nullable: false
      end
    end
  end
end
