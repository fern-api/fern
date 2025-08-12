# frozen_string_literal: true

module V2
    module Types
        class TestCaseImplementation < Internal::Types::Model
            field :description, TestCaseImplementationDescription, optional: true, nullable: true
            field :function, TestCaseFunction, optional: true, nullable: true
        end
    end
end
