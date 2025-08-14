# frozen_string_literal: true

module Seed
    module Types
        class BasicCustomFiles < Internal::Types::Model
            field :method_name, String, optional: false, nullable: false
            field :signature, Seed::V2::Problem::NonVoidFunctionSignature, optional: false, nullable: false
            field :additional_files, Internal::Types::Hash[Seed::Commons::Language, Seed::V2::Problem::Files], optional: false, nullable: false
            field :basic_test_case_template, Seed::V2::Problem::BasicTestCaseTemplate, optional: false, nullable: false

    end
end
