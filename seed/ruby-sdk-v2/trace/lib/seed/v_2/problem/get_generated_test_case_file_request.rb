# frozen_string_literal: true

module Seed
    module Types
        class GetGeneratedTestCaseFileRequest < Internal::Types::Model
            field :template, Seed::V2::Problem::TestCaseTemplate, optional: true, nullable: false
            field :test_case, Seed::V2::Problem::TestCaseV2, optional: false, nullable: false

    end
end
