# frozen_string_literal: true

module Seed
    module Types
        class FunctionImplementationForMultipleLanguages < Internal::Types::Model
            field :code_by_language, Internal::Types::Hash[Seed::Commons::Language, Seed::V2::Problem::FunctionImplementation], optional: false, nullable: false

    end
end
