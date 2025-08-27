# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class UnexpectedLanguageError < Internal::Types::Model
        field :expected_language, -> { Seed::Commons::Types::Language }, optional: false, nullable: false
        field :actual_language, -> { Seed::Commons::Types::Language }, optional: false, nullable: false
      end
    end
  end
end
