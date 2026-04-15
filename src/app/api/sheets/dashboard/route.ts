import { NextRequest, NextResponse } from "next/server";

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwuuNcZunkJB8Uv3dW6J412CryGVKL3V88aBikEB2lKnUMPkakAc1TnsVRjehfsRPtZ/exec";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "";
    const role = searchParams.get("role") || "";

    if (!userId || !role) {
      return NextResponse.json(
        { ok: false, error: "Faltan userId o role" },
        { status: 400 }
      );
    }

    const targetUrl = `${APPS_SCRIPT_URL}?action=homeData&userId=${encodeURIComponent(
      userId
    )}&role=${encodeURIComponent(role)}`;

    const response = await fetch(targetUrl, {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
      headers: {
        Accept: "application/json",
      },
    });

    const text = await response.text();

    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: "La respuesta del Apps Script no fue JSON válido",
          raw: text,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Error interno",
      },
      { status: 500 }
    );
  }
}