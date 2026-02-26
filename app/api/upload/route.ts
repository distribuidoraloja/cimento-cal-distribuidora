import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    const supabase = await createClient()

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${ext}`
    const filePath = `uploads/${fileName}`

    // Convert file to ArrayBuffer then to Buffer for reliable upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.log("[v0] Upload error:", uploadError.message)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from("images").getPublicUrl(filePath)

    console.log("[v0] Upload success, URL:", urlData.publicUrl)
    return NextResponse.json({ url: urlData.publicUrl })
  } catch (err) {
    console.log("[v0] Upload catch error:", err)
    return NextResponse.json({ error: "Erro ao fazer upload" }, { status: 500 })
  }
}
