# frozen_string_literal: true

module Seed
    module Types
        class GetGeneratedTestCaseFileRequest < Internal::Types::Model
            field :template, Seed::V2::V3::Problem::TestCaseTemplate, optional: true, nullable: false
            field :test_case, Seed::V2::V3::Problem::TestCaseV2, optional: false, nullable: false

    end
end
