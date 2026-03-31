# frozen_string_literal: true

module Seed
  module File
    module Types
      class File < Internal::Types::Model
        field :name, -> { String }, optional: false, nullable: false
        field :contents, -> { String }, optional: false, nullable: false
        field :info, -> { Seed::File::Types::FileInfo }, optional: false, nullable: false
      end
    end
  end
end
