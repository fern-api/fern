# frozen_string_literal: true

module Seed
  module Types
    class FileDirectory < Internal::Types::Model
      field :name, -> { String }, optional: false, nullable: false
      field :files, -> { Internal::Types::Array[Seed::Types::File] }, optional: true, nullable: false
      field :directories, -> { Internal::Types::Array[Seed::Types::FileDirectory] }, optional: true, nullable: false
    end
  end
end
