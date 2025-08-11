# frozen_string_literal: true

module V2
    module Types
        class GetGeneratedTestCaseTemplateFileRequest < Internal::Types::Model
            field :template, TestCaseTemplate, optional: true, nullable: true
        end
    end
end
