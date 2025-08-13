# frozen_string_literal: true

module Seed
    module Types
        class GetGeneratedTestCaseTemplateFileRequest < Internal::Types::Model
            field :template, Seed::V2::V3::Problem::TestCaseTemplate, optional: false, nullable: false

    end
end
