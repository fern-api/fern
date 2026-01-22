# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class UnexpectedLanguageError < Internal::Types::Model
        field :expected_language, -> { FernTrace::Commons::Types::Language }, optional: false, nullable: false, api_name: "expectedLanguage"
        field :actual_language, -> { FernTrace::Commons::Types::Language }, optional: false, nullable: false, api_name: "actualLanguage"
      end
    end
  end
end
