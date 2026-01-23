# frozen_string_literal: true

module FernAudiences
  module FolderD
    module Service
      module Types
        class Response < Internal::Types::Model
          field :foo, -> { String }, optional: false, nullable: false
        end
      end
    end
  end
end
