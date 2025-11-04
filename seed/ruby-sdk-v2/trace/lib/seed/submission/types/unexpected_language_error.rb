# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class UnexpectedLanguageError < Internal::Types::Model
        field :expected_language, lambda {
          Seed::Commons::Types::Language
        }, optional: false, nullable: false, api_name: "expectedLanguage"
        field :actual_language, lambda {
          Seed::Commons::Types::Language
        }, optional: false, nullable: false, api_name: "actualLanguage"
      end
    end
  end
end
