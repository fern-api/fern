# frozen_string_literal: true

module V2
    module Types
        class TestCaseV2 < Internal::Types::Model
            field :metadata, TestCaseMetadata, optional: true, nullable: true
            field :implementation, TestCaseImplementationReference, optional: true, nullable: true
            field :arguments, Array, optional: true, nullable: true
            field :expects, Array, optional: true, nullable: true
        end
    end
end
