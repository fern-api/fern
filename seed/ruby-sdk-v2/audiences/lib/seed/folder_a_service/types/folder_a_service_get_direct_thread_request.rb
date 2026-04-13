# frozen_string_literal: true

module Seed
  module FolderAService
    module Types
      class FolderAServiceGetDirectThreadRequest < Internal::Types::Model
        field :ids, -> { String }, optional: true, nullable: false
        field :tags, -> { String }, optional: true, nullable: false
      end
    end
  end
end
