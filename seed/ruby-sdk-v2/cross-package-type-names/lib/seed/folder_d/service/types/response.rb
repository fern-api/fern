# frozen_string_literal: true

module Seed
  module FolderD
    module Service
      module Types
        class Response < Internal::Types::Model
          field :foo, -> { Seed::FolderB::Common::Types::Foo }, optional: true, nullable: false
        end
      end
    end
  end
end
