# frozen_string_literal: true

module FernObjectsWithImports
  module File
    module Directory
      module Types
        class Directory < Internal::Types::Model
          field :name, -> { String }, optional: false, nullable: false
          field :files, -> { Internal::Types::Array[FernObjectsWithImports::File::Types::File] }, optional: true, nullable: false
          field :directories, -> { Internal::Types::Array[FernObjectsWithImports::File::Directory::Types::Directory] }, optional: true, nullable: false
        end
      end
    end
  end
end
