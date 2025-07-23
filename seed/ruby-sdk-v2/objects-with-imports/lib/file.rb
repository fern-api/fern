# frozen_string_literal: true

module File
    module Types
        class File < Internal::Types::Model
            field :name, String, optional: true, nullable: true
            field :contents, String, optional: true, nullable: true
            field :info, FileInfo, optional: true, nullable: true
        end
    end
end
