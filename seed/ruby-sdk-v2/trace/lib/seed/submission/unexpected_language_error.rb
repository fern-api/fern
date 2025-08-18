# frozen_string_literal: true

module Seed
    module Types
        class UnexpectedLanguageError < Internal::Types::Model
            field :expected_language, Seed::Commons::Language, optional: false, nullable: false
            field :actual_language, Seed::Commons::Language, optional: false, nullable: false

    end
end
