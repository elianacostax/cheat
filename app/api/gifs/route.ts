import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const key = process.env.GIPHY_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: 'Falta configurar GIPHY_API_KEY en .env' },
      { status: 500 }
    );
  }

  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  const endpoint = q ? 'search' : 'trending';

  const url = new URL(`https://api.giphy.com/v1/gifs/${endpoint}`);
  url.searchParams.set('api_key', key);
  url.searchParams.set('limit', '24');
  url.searchParams.set('rating', 'pg-13');
  if (q) url.searchParams.set('q', q);

  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    return NextResponse.json({ error: 'No se pudieron cargar los GIFs' }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json({
    gifs: (data.data ?? []).map((g: any) => ({
      id: g.id,
      preview: g.images?.fixed_width?.url ?? g.images?.original?.url,
      url: g.images?.downsized_medium?.url ?? g.images?.original?.url,
    })),
  });
}
