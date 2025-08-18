# frozen_string_literal: true

module Seed
    module Types
        class DefaultProvidedFile < Internal::Types::Model
            field :file, Seed::V2::Problem::FileInfoV2, optional: false, nullable: false
            field :related_types, Internal::Types::Array[Seed::Commons::VariableType], optional: false, nullable: false

    end
end
