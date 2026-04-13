# frozen_string_literal: true

module Seed
  module Types
    class FolderBFoo < Internal::Types::Model
      field :foo, -> { Seed::Types::FolderCFolderCFoo }, optional: true, nullable: false
    end
  end
end
