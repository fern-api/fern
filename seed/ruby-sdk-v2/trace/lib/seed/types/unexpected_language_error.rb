# frozen_string_literal: true

module Seed
  module Types
    class UnexpectedLanguageError < Internal::Types::Model
      field :expected_language, -> { Seed::Types::Language }, optional: false, nullable: false, api_name: "expectedLanguage"
      field :actual_language, -> { Seed::Types::Language }, optional: false, nullable: false, api_name: "actualLanguage"
    end
  end
end
