# frozen_string_literal: true

module FernExamples
  module Types
    module Types
      class Directory < Internal::Types::Model
        field :name, -> { String }, optional: false, nullable: false
        field :files, -> { Internal::Types::Array[FernExamples::Types::Types::File] }, optional: true, nullable: false
        field :directories, -> { Internal::Types::Array[FernExamples::Types::Types::Directory] }, optional: true, nullable: false
      end
    end
  end
end
