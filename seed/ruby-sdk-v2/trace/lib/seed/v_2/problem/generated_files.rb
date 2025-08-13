# frozen_string_literal: true

module Seed
    module Types
        class GeneratedFiles < Internal::Types::Model
            field :generated_test_case_files, Internal::Types::Hash[Seed::Commons::Language, Seed::V2::Problem::Files], optional: false, nullable: false
            field :generated_template_files, Internal::Types::Hash[Seed::Commons::Language, Seed::V2::Problem::Files], optional: false, nullable: false
            field :other, Internal::Types::Hash[Seed::Commons::Language, Seed::V2::Problem::Files], optional: false, nullable: false

    end
end
