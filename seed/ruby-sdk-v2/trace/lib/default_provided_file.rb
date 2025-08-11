# frozen_string_literal: true

module V2
    module Types
        class DefaultProvidedFile < Internal::Types::Model
            field :file, FileInfoV2, optional: true, nullable: true
            field :related_types, Array, optional: true, nullable: true
        end
    end
end
