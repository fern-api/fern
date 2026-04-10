# frozen_string_literal: true

module Seed
  module Types
    class GetDefaultStarterFilesResponse < Internal::Types::Model
      field :files, -> { Internal::Types::Hash[String, Seed::Types::ProblemFiles] }, optional: false, nullable: false
    end
  end
end
