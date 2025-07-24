# frozen_string_literal: true

module V2
    module Types
        class FileInfoV2 < Internal::Types::Model
            field :filename, String, optional: true, nullable: true
            field :directory, String, optional: true, nullable: true
            field :contents, String, optional: true, nullable: true
            field :editable, Boolean, optional: true, nullable: true
        end
    end
end
