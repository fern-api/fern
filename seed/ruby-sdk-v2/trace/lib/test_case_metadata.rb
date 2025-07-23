# frozen_string_literal: true

module V2
    module Types
        class TestCaseMetadata < Internal::Types::Model
            field :id, TestCaseId, optional: true, nullable: true
            field :name, String, optional: true, nullable: true
            field :hidden, Boolean, optional: true, nullable: true
        end
    end
end
