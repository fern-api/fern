# frozen_string_literal: true

module V2
    module Types
        class GetGeneratedTestCaseFileRequest < Internal::Types::Model
            field :template, Array, optional: true, nullable: true
            field :test_case, TestCaseV2, optional: true, nullable: true
        end
    end
end
