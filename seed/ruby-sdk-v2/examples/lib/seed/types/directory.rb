# frozen_string_literal: true

module Seed
    module Types
        class Directory < Internal::Types::Model
            field :name, String, optional: false, nullable: false
            field :files, Internal::Types::Array[Seed::Types::File], optional: true, nullable: false
            field :directories, Internal::Types::Array[Seed::Types::Directory], optional: true, nullable: false

    end
end
