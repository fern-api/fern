# frozen_string_literal: true

module Commons
    module Types
        class FileInfo < Internal::Types::Model
            field :filename, String, optional: true, nullable: true
            field :contents, String, optional: true, nullable: true
        end
    end
end
