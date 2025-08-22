# frozen_string_literal: true

module Seed
  module File
    module Directory
      module Types
        class Directory < Internal::Types::Model
          field :name, -> { String }, optional: false, nullable: false
          field :files, -> { Internal::Types::Array[Seed::File::Types::File] }, optional: true, nullable: false
          field :directories, lambda {
            Internal::Types::Array[Seed::File::Directory::Types::Directory]
          }, optional: true, nullable: false
        end
      end
    end
  end
end
