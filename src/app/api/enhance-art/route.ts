import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_ART_MODEL || process.env.GEMINI_MODEL || 'gemini-3-pro-image-preview';
const ART_PROMPT = process.env.GEMINI_ART_PROMPT ||
  '이 작품의 예술적 완성도를 높여주세요. ' +
  '작가의 원래 구도와 주제를 유지하면서, 다음을 개선해주세요: ' +
  '색채의 깊이와 조화를 강화하고, 붓터치와 질감의 표현력을 높이고, ' +
  '명암 대비를 더 극적으로 만들고, 전체적인 완성도를 갤러리 전시 수준으로 올려주세요. ' +
  '중요: 작품의 구도, 주제, 기본 색감 방향은 반드시 유지하세요. ' +
  '새로운 요소를 추가하거나 구도를 변경하지 마세요. ' +
  '작가의 원래 의도를 존중하면서 표현력만 강화해주세요.';

export async function POST(request: NextRequest) {
  const session = request.cookies.get('__session');
  if (!session?.value) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY가 설정되지 않았습니다.' },
      { status: 500 }
    );
  }

  try {
    const { imageBase64, mimeType } = await request.json();

    if (!imageBase64 || !mimeType) {
      return NextResponse.json(
        { error: '이미지 데이터가 필요합니다.' },
        { status: 400 }
      );
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const body = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType,
                data: imageBase64,
              },
            },
            { text: ART_PROMPT },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(JSON.stringify({ level: 'ERROR', action: 'enhance-art.gemini', source: 'server', error: errorText }));
      return NextResponse.json(
        { error: 'Gemini API 호출에 실패했습니다.' },
        { status: 502 }
      );
    }

    const result = await response.json();

    const parts = result.candidates?.[0]?.content?.parts;
    if (!parts) {
      return NextResponse.json(
        { error: 'Gemini 응답에서 이미지를 찾을 수 없습니다.' },
        { status: 502 }
      );
    }

    const imagePart = parts.find(
      (p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData?.data
    );

    if (!imagePart?.inlineData) {
      const textPart = parts.find((p: { text?: string }) => p.text);
      return NextResponse.json(
        { error: textPart?.text || '이미지 생성에 실패했습니다.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      imageBase64: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType || 'image/jpeg',
    });
  } catch (err) {
    console.error(JSON.stringify({ level: 'ERROR', action: 'enhance-art.server', source: 'server', error: String(err) }));
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
