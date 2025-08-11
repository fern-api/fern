# frozen_string_literal: true

module V2
    module Types
        class GeneratedFiles < Internal::Types::Model
            field :generated_test_case_files, Array, optional: true, nullable: true
            field :generated_template_files, Array, optional: true, nullable: true
            field :other, Array, optional: true, nullable: true
        end
    end
end
