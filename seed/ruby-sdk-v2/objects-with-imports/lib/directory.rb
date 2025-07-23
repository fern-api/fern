# frozen_string_literal: true

module File
    module Types
        class Directory < Internal::Types::Model
            field :name, String, optional: true, nullable: true
            field :files, Array, optional: true, nullable: true
            field :directories, Array, optional: true, nullable: true
        end
    end
end
