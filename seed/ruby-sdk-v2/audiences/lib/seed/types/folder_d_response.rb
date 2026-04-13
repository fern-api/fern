# frozen_string_literal: true

module Seed
  module Types
    class FolderDResponse < Internal::Types::Model
      field :foo, -> { String }, optional: false, nullable: false
    end
  end
end
