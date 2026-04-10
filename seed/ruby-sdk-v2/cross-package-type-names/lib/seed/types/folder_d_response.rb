# frozen_string_literal: true

module Seed
  module Types
    class FolderDResponse < Internal::Types::Model
      field :foo, -> { Seed::Types::FolderBFoo }, optional: true, nullable: false
    end
  end
end
