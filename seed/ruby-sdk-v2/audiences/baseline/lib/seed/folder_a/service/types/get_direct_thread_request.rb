# frozen_string_literal: true

module Seed
  module FolderA
    module Service
      module Types
        class GetDirectThreadRequest < Internal::Types::Model
          field :ids, -> { String }, optional: false, nullable: false
          field :tags, -> { String }, optional: false, nullable: false
        end
      end
    end
  end
end
