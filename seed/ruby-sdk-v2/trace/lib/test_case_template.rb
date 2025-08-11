# frozen_string_literal: true

module V2
    module Types
        class TestCaseTemplate < Internal::Types::Model
            field :template_id, TestCaseTemplateId, optional: true, nullable: true
            field :name, String, optional: true, nullable: true
            field :implementation, TestCaseImplementation, optional: true, nullable: true
        end
    end
end
