import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-image';
const ENHANCE_PROMPT = process.env.GEMINI_ENHANCE_PROMPT ||
  '이 작품 사진의 촬영 품질을 보정해주세요. ' +
  '갤러리 조명 아래에서 전문 카메라로 촬영한 것처럼 색감을 교정하고 조명을 균일하게 만들어주세요. ' +
  '작품의 원래 구도, 색상, 스타일은 절대 변경하지 마세요. ' +
  '배경은 깨끗한 흰색 벽으로 정리해주세요.';

export async function POST(request: NextRequest) {
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
            { text: ENHANCE_PROMPT },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ['IMAGE', 'TEXT'],
        responseMimeType: 'image/jpeg',
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return NextResponse.json(
        { error: 'Gemini API 호출에 실패했습니다.' },
        { status: 502 }
      );
    }

    const result = await response.json();

    // Extract image from response
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
      // Gemini may return text-only response
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
    console.error('Enhance API error:', err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
