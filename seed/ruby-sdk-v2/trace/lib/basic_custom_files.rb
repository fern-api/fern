# frozen_string_literal: true

module V2
    module Types
        class BasicCustomFiles < Internal::Types::Model
            field :method_name, String, optional: true, nullable: true
            field :signature, NonVoidFunctionSignature, optional: true, nullable: true
            field :additional_files, Array, optional: true, nullable: true
            field :basic_test_case_template, BasicTestCaseTemplate, optional: true, nullable: true
        end
    end
end
