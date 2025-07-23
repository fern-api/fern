# frozen_string_literal: true

module Submission
    module Types
        class UnexpectedLanguageError < Internal::Types::Model
            field :expected_language, Language, optional: true, nullable: true
            field :actual_language, Language, optional: true, nullable: true
        end
    end
end
