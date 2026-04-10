# frozen_string_literal: true

module Seed
  module Types
    class FolderCFolderCFoo < Internal::Types::Model
      field :bar_property, -> { String }, optional: false, nullable: false
    end
  end
end
