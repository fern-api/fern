# frozen_string_literal: true

module FernObjectsWithImports
  module File
    module Types
      class File < Internal::Types::Model
        field :name, -> { String }, optional: false, nullable: false
        field :contents, -> { String }, optional: false, nullable: false
        field :info, -> { FernObjectsWithImports::File::Types::FileInfo }, optional: false, nullable: false
      end
    end
  end
end
