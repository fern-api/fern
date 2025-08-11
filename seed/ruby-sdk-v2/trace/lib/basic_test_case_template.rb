# frozen_string_literal: true

module V2
    module Types
        class BasicTestCaseTemplate < Internal::Types::Model
            field :template_id, TestCaseTemplateId, optional: true, nullable: true
            field :name, String, optional: true, nullable: true
            field :description, TestCaseImplementationDescription, optional: true, nullable: true
            field :expected_value_parameter_id, ParameterId, optional: true, nullable: true
        end
    end
end
