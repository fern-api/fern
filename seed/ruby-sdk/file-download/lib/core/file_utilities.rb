# frozen_string_literal: true

require "faraday/multipart"
require "mini_mime"

module SeedFileDownloadClient
  # Utility class for managing files.
  class FileUtilities
    # @param file_like [String, IO] The file to be uploaded, or a string path to the file.
    # @return [Faraday::Multipart::FilePart]
    def self.as_faraday_multipart(file_like:)
      path = if file_like.is_a?(String)
               file_like
             else
               file_like.path
             end
      mime_type = MiniMime.lookup_by_filename(path)
      mime_type = if mime_type.nil?
                    "application/octet-stream"
                  else
                    mime_type.content_type
                  end
      Faraday::Multipart::FilePart.new(file_like, mime_type)
    end
  end
end
