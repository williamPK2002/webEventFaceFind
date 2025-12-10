import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    // Validate file types
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
      }
    }

    // In production: Upload to S3/MinIO, extract EXIF, store metadata
    const uploadedPhotos = files.map((file, index) => ({
      id: `photo_${eventId}_${index}`,
      filename: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      exif: {
        // Would be extracted from file
        date: new Date().toISOString(),
        camera: "Unknown",
      },
    }))

    return NextResponse.json({
      eventId,
      uploaded: uploadedPhotos.length,
      photos: uploadedPhotos,
    })
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
