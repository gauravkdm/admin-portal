"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"

interface MediaItem {
  Id: number
  MediaUrl: string | null
  Type: number
}

interface MediaGalleryProps {
  media: MediaItem[]
}

export function MediaGallery({ media }: MediaGalleryProps) {
  const itemsWithUrl = media.filter((m) => m.MediaUrl)

  if (itemsWithUrl.length === 0) return null

  return (
    <Card>
      <div className="p-6">
        <CardTitle>Media Gallery</CardTitle>
        <CardDescription>
          {itemsWithUrl.length} image{itemsWithUrl.length !== 1 ? "s" : ""}
        </CardDescription>
      </div>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {itemsWithUrl.map((item) => (
            <a
              key={item.Id}
              href={item.MediaUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="block aspect-square relative rounded-lg overflow-hidden border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.MediaUrl!}
                alt={`Event media ${item.Id}`}
                className="w-full h-full object-cover"
              />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
